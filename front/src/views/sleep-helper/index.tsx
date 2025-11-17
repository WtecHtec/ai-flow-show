// front/src/views/sleep-helper/index.tsx
import { useState, useEffect, useRef } from 'react';
import { Button, Input, Space, InputNumber, message, Modal, Form, Select, Popconfirm } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, StopOutlined, SoundOutlined, HistoryOutlined, DeleteOutlined } from '@ant-design/icons';
import './index.moudle.scss'

interface Checkpoint {
  id: number;
  time: number; // timestamp in seconds
}

interface SleepRecord {
  id: string;
  name: string;
  checkpoints: Checkpoint[];
  totalDuration: number;
  soundUrl: string;
  createdAt: string;
}

const SleepHelperPage = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [loopCount, setLoopCount] = useState(1);
  const [soundUrl, setSoundUrl] = useState('');
  const [customSoundUrl, setCustomSoundUrl] = useState('');
  const [playModalVisible, setPlayModalVisible] = useState(false);
  const [soundModalVisible, setSoundModalVisible] = useState(false);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [playbackCountdown, setPlaybackCountdown] = useState<number | null>(null);
  const [savedRecords, setSavedRecords] = useState<SleepRecord[]>([]);
  const [form] = Form.useForm();

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playTimerRef = useRef<NodeJS.Timeout[]>([]);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const playbackStartTimeRef = useRef<number>(0);
  const currentCheckpointIndexRef = useRef<number>(0);
  const currentLoopRef = useRef<number>(0);
  const currentRecordRef = useRef<SleepRecord | null>(null);
  const isPlayingRef = useRef<boolean>(false); // Ref for isPlaying state to avoid async issues

  // Preset sounds
  const presetSounds = [
    { label: 'Water Drop', value: 'https://downsc.chinaz.net/Files/DownLoad/sound1/201910/12068.mp3' },
    { label: 'Custom', value: 'custom' },
  ];

  // Load saved records from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sleep-helper-records');
    if (saved) {
      try {
        setSavedRecords(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load records:', e);
      }
    }
  }, []);

  // Save records to localStorage
  const saveRecordsToStorage = (records: SleepRecord[]) => {
    localStorage.setItem('sleep-helper-records', JSON.stringify(records));
  };

  // Initialize audio
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      // Clear all play timers
      playTimerRef.current.forEach(timer => clearTimeout(timer));
      playTimerRef.current = [];
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, []);

  // Timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 100);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  // Countdown timer during playback - countdown by total duration
  useEffect(() => {
    if (isPlaying && playbackCountdown !== null) {
      countdownTimerRef.current = setInterval(() => {
        const record = currentRecordRef.current;
        if (!record || !isPlayingRef.current) return; // Use ref instead of state

        const now = Date.now();
        const elapsed = Math.floor((now - playbackStartTimeRef.current) / 1000);
        const totalDuration = record.totalDuration;
        const loopCountValue = loopCount;
        const totalPlaybackDuration = totalDuration * loopCountValue;

        // Calculate remaining time (countdown from total duration)
        const remaining = totalPlaybackDuration - elapsed;

        if (remaining > 0) {
          setPlaybackCountdown(remaining);
        } else {
          setPlaybackCountdown(0);
        }
      }, 100);
    } else {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
    }

    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, [isPlaying, playbackCountdown, loopCount]);

  // Start timer
  const handleStart = () => {
    setIsRecording(true);
    startTimeRef.current = Date.now();
    setElapsedTime(0);
    setCheckpoints([]);
  };

  // Record checkpoint
  const handleCheckpoint = () => {
    if (!isRecording) {
      message.warning('Please start the timer first');
      return;
    }
    const currentTime = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const newCheckpoint: Checkpoint = {
      id: checkpoints.length + 1,
      time: currentTime,
    };
    setCheckpoints([...checkpoints, newCheckpoint]);
    message.success(`Checkpoint recorded: ${formatTime(currentTime)}`);
  };

  // Stop and prepare to play
  const handleStop = () => {
    if (!isRecording) {
      return;
    }
    setIsRecording(false);
    
    if (checkpoints.length === 0) {
      message.warning('No checkpoints recorded');
      return;
    }

    // Calculate total duration
    const totalDuration = checkpoints[checkpoints.length - 1].time;

    // Create record
    const record: SleepRecord = {
      id: Date.now().toString(),
      name: `Record ${new Date().toLocaleString('en-US')}`,
      checkpoints: [...checkpoints],
      totalDuration,
      soundUrl: soundUrl || customSoundUrl,
      createdAt: new Date().toISOString(),
    };

    currentRecordRef.current = record;
    
    // Save to history
    const updatedRecords = [...savedRecords, record];
    setSavedRecords(updatedRecords);
    saveRecordsToStorage(updatedRecords);
    
    // Check if sound is selected
    if (!soundUrl && !customSoundUrl) {
      message.warning('Please select a sound first');
      setSoundModalVisible(true);
      return;
    }

    // Open play modal
    setPlayModalVisible(true);
    form.setFieldsValue({ loopCount: 1 });
  };

  // Play sound - improved audio playback with proper loading
  const playSound = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      const record = currentRecordRef.current;
      if (!record) {
        reject(new Error('No record available'));
        return;
      }

      const url = record.soundUrl;
      if (!url) {
        reject(new Error('Sound URL is empty'));
        return;
      }

      // Create new Audio instance for each playback
      const audio = new Audio(url);
      audio.volume = 1.0;

      let isResolved = false;

      const cleanup = () => {
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
        audio.removeEventListener('canplaythrough', handleCanPlayThrough);
        audio.removeEventListener('loadeddata', handleLoadedData);
      };

      const handleEnded = () => {
        if (!isResolved) {
          isResolved = true;
          cleanup();
          resolve();
        }
      };

      const handleError = (e: any) => {
        if (!isResolved) {
          isResolved = true;
          cleanup();
          console.error('Audio error:', e);
          reject(new Error('Audio playback failed'));
        }
      };

      const handleCanPlayThrough = () => {
        // Audio is ready to play
        if (!isResolved) {
          audio.play()
            .then(() => {
              // Successfully started playing
            })
            .catch((error) => {
              if (!isResolved) {
                isResolved = true;
                cleanup();
                console.error('Play error:', error);
                reject(new Error(`Failed to play: ${error.message}`));
              }
            });
        }
      };

      const handleLoadedData = () => {
        // Try to play when data is loaded
        if (!isResolved && audio.readyState >= 2) {
          audio.play()
            .then(() => {
              // Successfully started playing
            })
            .catch((error) => {
              if (!isResolved) {
                isResolved = true;
                cleanup();
                console.error('Play error:', error);
                reject(new Error(`Failed to play: ${error.message}`));
              }
            });
        }
      };

      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleError);
      audio.addEventListener('canplaythrough', handleCanPlayThrough);
      audio.addEventListener('loadeddata', handleLoadedData);

      // Try to play immediately if already loaded
      if (audio.readyState >= 3) {
        audio.play()
          .then(() => {
            // Successfully started playing
          })
          .catch((error) => {
            if (!isResolved) {
              isResolved = true;
              cleanup();
              console.error('Play error:', error);
              reject(new Error(`Failed to play: ${error.message}`));
            }
          });
      }

      // Timeout if audio doesn't load
      setTimeout(() => {
        if (!isResolved && audio.readyState < 2) {
          isResolved = true;
          cleanup();
          reject(new Error('Audio failed to load'));
        }
      }, 5000);
    });
  };

  // Start playback - play audio at each checkpoint's recorded time
  const handleStartPlay = async () => {
    const record = currentRecordRef.current;
    if (!record || record.checkpoints.length === 0) {
      message.warning('No checkpoints to play');
      return;
    }

    const loopCountValue = form.getFieldValue('loopCount') || 1;
    setLoopCount(loopCountValue);
    isPlayingRef.current = true; // Set ref first for immediate access
    setIsPlaying(true);
    playbackStartTimeRef.current = Date.now();
    currentCheckpointIndexRef.current = 0;
    currentLoopRef.current = 0;
    
    const totalDuration = record.totalDuration;
    const totalPlaybackDuration = totalDuration * loopCountValue;
    setPlaybackCountdown(totalPlaybackDuration);
    
    // Clear previous timers
    playTimerRef.current.forEach(timer => clearTimeout(timer));
    playTimerRef.current = [];
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
    }

    // Schedule all checkpoints for all loops
    for (let loop = 0; loop < loopCountValue; loop++) {
      record.checkpoints.forEach((checkpoint, index) => {
        // Calculate absolute time for this checkpoint in this loop
        const absoluteTime = loop * totalDuration + checkpoint.time;
        const delay = absoluteTime * 1000; // Convert to milliseconds

        const timer = setTimeout(async () => {
          if (!isPlayingRef.current) return; // Use ref instead of state
          
          try {
            await playSound();
          } catch (error: any) {
            console.error('Playback error:', error);
            message.error(error.message || 'Playback failed');
            handleStopPlay();
          }
        }, delay);
        
        playTimerRef.current.push(timer);
      });
    }

    // Set completion timer
    const totalPlaybackTime = totalDuration * loopCountValue * 1000;
    const completionTimer = setTimeout(() => {
      if (isPlayingRef.current) { // Use ref instead of state
        handleStopPlay();
        message.success('Playback completed');
      }
    }, totalPlaybackTime);
    
    playTimerRef.current.push(completionTimer);
  };

  // Stop playback
  const handleStopPlay = () => {
    isPlayingRef.current = false; // Set ref first for immediate access
    setIsPlaying(false);
    setPlaybackCountdown(null);
    
    // Clear all timers
    playTimerRef.current.forEach(timer => clearTimeout(timer));
    playTimerRef.current = [];
    
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  // Load record from history
  const handleLoadRecord = (record: SleepRecord) => {
    currentRecordRef.current = record;
    setSoundUrl(record.soundUrl === customSoundUrl ? 'custom' : record.soundUrl);
    if (record.soundUrl !== soundUrl && record.soundUrl !== customSoundUrl) {
      setCustomSoundUrl(record.soundUrl);
      setSoundUrl('custom');
    }
    setHistoryModalVisible(false);
    setPlayModalVisible(true);
    form.setFieldsValue({ loopCount: 1 });
    message.success('Record loaded');
  };

  // Delete record from history
  const handleDeleteRecord = (id: string) => {
    const updatedRecords = savedRecords.filter(r => r.id !== id);
    setSavedRecords(updatedRecords);
    saveRecordsToStorage(updatedRecords);
    message.success('Record deleted');
  };

  // Format time
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate total duration
  const calculateTotalDuration = (record: SleepRecord | null, loops: number) => {
    if (!record) return 0;
    return record.totalDuration * loops;
  };

  // Select sound
  const handleSoundSelect = (value: string) => {
    setSoundUrl(value);
    if (value !== 'custom') {
      setCustomSoundUrl('');
    }
  };

  // Save custom sound
  const handleSaveCustomSound = () => {
    if (!customSoundUrl) {
      setSoundModalVisible(false);
      return;
    }
    // Validate URL format
    try {
      new URL(customSoundUrl);
      setSoundUrl('custom');
      setSoundModalVisible(false);
      message.success('Sound set successfully');
    } catch {
      message.error('Please enter a valid URL');
    }
  };

  // Reset
  const handleReset = () => {
    setIsRecording(false);
    setElapsedTime(0);
    setCheckpoints([]);
    handleStopPlay();
    currentRecordRef.current = null;
  };

  const record = currentRecordRef.current;
  const currentSoundUrl = soundUrl === 'custom' ? customSoundUrl : soundUrl;
  const currentLoopCount = form.getFieldValue('loopCount') || 1;
  const totalDuration = calculateTotalDuration(record, currentLoopCount);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 pb-20">
      <div className="max-w-md mx-auto">
        {/* Title */}
        <div className="text-center mb-6 pt-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Sleep Helper</h1>
          <p className="text-gray-600 text-sm">Record checkpoints and loop sleep sounds</p>
        </div>

        {/* Sound selection */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-700 font-medium">Sound</span>
            <Space>
              <Button
                type="link"
                icon={<HistoryOutlined />}
                onClick={() => setHistoryModalVisible(true)}
                className="p-0"
              >
                History
              </Button>
              <Button
                type="link"
                icon={<SoundOutlined />}
                onClick={() => setSoundModalVisible(true)}
                className="p-0"
              >
                {currentSoundUrl ? 'Set' : 'Select Sound'}
              </Button>
            </Space>
          </div>
          {currentSoundUrl && (
            <div className="text-xs text-gray-500 truncate">
              {currentSoundUrl.length > 50 ? `${currentSoundUrl.substring(0, 50)}...` : currentSoundUrl}
            </div>
          )}
        </div>

        {/* Timer card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
          <div className="text-center">
            <div className="text-5xl font-mono font-bold text-blue-600 mb-6">
              {formatTime(elapsedTime)}
            </div>
            
            <Space direction="vertical" size="middle" className="w-full">
              {!isRecording ? (
                <Button
                  type="primary"
                  size="large"
                  block
                  onClick={handleStart}
                  className="h-12 text-lg"
                >
                  Start Timer
                </Button>
              ) : (
                <>
                  <Button
                    type="default"
                    size="large"
                    block
                    onClick={handleCheckpoint}
                    className="h-12 text-lg"
                  >
                    Record Checkpoint ({checkpoints.length})
                  </Button>
                  <Button
                    type="primary"
                    danger
                    size="large"
                    block
                    icon={<StopOutlined />}
                    onClick={handleStop}
                    className="h-12 text-lg"
                  >
                    Stop & Play
                  </Button>
                </>
              )}
            </Space>
          </div>

          {/* Current checkpoints list */}
          {checkpoints.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-sm font-semibold text-gray-600 mb-3">Current Checkpoints:</h3>
              <div className="flex flex-wrap gap-2">
                {checkpoints.map((cp) => (
                  <span
                    key={cp.id}
                    className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                  >
                    {formatTime(cp.time)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Reset button */}
        {(checkpoints.length > 0 || record) && (
          <Button
            block
            onClick={handleReset}
            className="mb-4"
          >
            Reset
          </Button>
        )}

        {/* History modal - simple list */}
        <Modal
          title="Checkpoint History"
          open={historyModalVisible}
          onCancel={() => setHistoryModalVisible(false)}
          footer={null}
          width={500}
        >
          {savedRecords.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No records yet
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {savedRecords.map((record) => (
                <div
                  key={record.id}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800 mb-1">
                        {record.name}
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>
                          <span className="font-medium">Checkpoints:</span> {record.checkpoints.length}
                        </div>
                        <div>
                          <span className="font-medium">Duration:</span> {formatTime(record.totalDuration)}
                        </div>
                        <div>
                          <span className="font-medium">Created:</span>{' '}
                          {new Date(record.createdAt).toLocaleString('en-US')}
                        </div>
                      </div>
                    </div>
                    <Space className="ml-4">
                      <Button
                        type="primary"
                        size="small"
                        onClick={() => handleLoadRecord(record)}
                      >
                        Load
                      </Button>
                      <Popconfirm
                        title="Delete this record?"
                        onConfirm={() => handleDeleteRecord(record.id)}
                        okText="Yes"
                        cancelText="No"
                      >
                        <Button
                          type="default"
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                        />
                      </Popconfirm>
                    </Space>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Modal>

        {/* Sound selection modal */}
        <Modal
          title="Select Sound"
          open={soundModalVisible}
          onCancel={() => setSoundModalVisible(false)}
          onOk={handleSaveCustomSound}
          okText="Save"
          cancelText="Cancel"
        >
          <Form layout="vertical">
            <Form.Item label="Preset Sounds">
              <Select
                value={soundUrl === 'custom' ? undefined : soundUrl}
                onChange={handleSoundSelect}
                placeholder="Select preset sound"
                options={presetSounds.filter(s => s.value !== 'custom')}
              />
            </Form.Item>
            <Form.Item label="Or enter custom MP3 URL">
              <Input
                value={customSoundUrl}
                onChange={(e) => setCustomSoundUrl(e.target.value)}
                placeholder="https://example.com/sound.mp3"
              />
            </Form.Item>
            {soundUrl === 'custom' && customSoundUrl && (
              <div className="mt-2">
                <audio controls src={customSoundUrl} className="w-full" />
              </div>
            )}
          </Form>
        </Modal>

        {/* Playback modal */}
        <Modal
          title="Play Checkpoints"
          open={playModalVisible}
          onCancel={() => {
            setPlayModalVisible(false);
            handleStopPlay();
          }}
          footer={null}
          className="mobile-modal"
        >
          {record && (
            <div>
              <Form form={form} layout="vertical">
                <Form.Item
                  name="loopCount"
                  label="Loop Count"
                  rules={[{ required: true, message: 'Please enter loop count' }]}
                  initialValue={1}
                >
                  <InputNumber
                    min={1}
                    style={{ width: '100%' }}
                    disabled={isPlaying}
                    size="large"
                    onChange={(value) => {
                      setLoopCount(value || 1);
                    }}
                  />
                </Form.Item>
              </Form>

              <div className="mb-4 space-y-2">
                <p className="text-gray-600">
                  <strong>Checkpoints:</strong> {record.checkpoints.length}
                </p>
                <p className="text-gray-600">
                  <strong>Single Duration:</strong> {formatTime(record.totalDuration)}
                </p>
                <p className="text-gray-600">
                  <strong>Total Duration:</strong>
                  <span className="text-blue-600 font-bold ml-2">
                    {formatTime(totalDuration)}
                  </span>
                </p>
              </div>

              {/* Countdown display */}
              {isPlaying && playbackCountdown !== null && (
                <div className="mb-4 p-4 bg-blue-50 rounded-lg text-center">
                  <p className="text-sm text-gray-600 mb-1">Remaining time:</p>
                  <p className="text-3xl font-mono font-bold text-blue-600">
                    {formatTime(playbackCountdown)}
                  </p>
                </div>
              )}

              <div className="mb-4">
                <h4 className="font-semibold mb-2 text-sm">Checkpoint Times:</h4>
                <div className="flex flex-wrap gap-2">
                  {record.checkpoints.map((cp) => (
                    <span
                      key={cp.id}
                      className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                    >
                      {formatTime(cp.time)}
                    </span>
                  ))}
                </div>
              </div>

              <div className="text-center">
                {!isPlaying ? (
                  <Button
                    type="primary"
                    size="large"
                    block
                    icon={<PlayCircleOutlined />}
                    onClick={handleStartPlay}
                    className="h-12 text-lg"
                  >
                    Start Playback
                  </Button>
                ) : (
                  <Button
                    type="default"
                    size="large"
                    block
                    icon={<PauseCircleOutlined />}
                    onClick={handleStopPlay}
                    className="h-12 text-lg"
                  >
                    Stop Playback
                  </Button>
                )}
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default SleepHelperPage;