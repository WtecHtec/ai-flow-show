import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  message,
  Popconfirm,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import http from '@/utils/http';
import type { ColumnsType } from 'antd/es/table';

interface Template {
  id: number;
  temp_id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

const TemplateManagePage = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await http.get('/api/templates') as any;
      setTemplates(res.templates || []);
    } catch (error: any) {
      message.error(error.response?.data?.error || '获取模板列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingTemplate(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Template) => {
    // 编辑时跳转到编辑器页面
    navigate(`/editor?temp_id=${record.temp_id}`);
  };

  const handleDelete = async (tempId: string) => {
    try {
      await http.delete(`/api/templates/${tempId}`);
      message.success('删除成功');
      fetchTemplates();
    } catch (error: any) {
      message.error(error.response?.data?.error || '删除失败');
    }
  };

  const handleView = (tempId: string) => {
    navigate(`/view/${tempId}`);
  };

  const handleSubmit = async (values: { name: string; description: string }) => {
    try {
      if (editingTemplate) {
        // 编辑模板 - 跳转到编辑器
        navigate(`/editor?temp_id=${editingTemplate.temp_id}`);
        setModalVisible(false);
        return;
      }

      // 创建模板 - 先创建，然后跳转到编辑器
      const res = await http.post('/api/templates', {
        ...values,
        schema_data: {}, // 初始为空，在编辑器中编辑
      }) as any;

      message.success('模板创建成功，正在跳转到编辑器...');
      setModalVisible(false);
      
      // 跳转到编辑器页面，传递模板ID
      navigate(`/editor?temp_id=${res.temp_id}`);
    } catch (error: any) {
      message.error(error.response?.data?.error || '操作失败');
    }
  };

  const columns: ColumnsType<Template> = [
    {
      title: '模板ID',
      dataIndex: 'temp_id',
      key: 'temp_id',
      width: 120,
    },
    {
      title: '模板名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (text) => new Date(text).toLocaleString('zh-CN'),
    },
    {
      title: '更新时间',
      dataIndex: 'updated_at',
      key: 'updated_at',
      width: 180,
      render: (text) => new Date(text).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleView(record.temp_id)}
          >
            查看
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个模板吗？"
            onConfirm={() => handleDelete(record.temp_id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">模板管理</h1>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            新建模板
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={templates}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
        />

        <Modal
          title={editingTemplate ? '编辑模板' : '新建模板'}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          onOk={() => form.submit()}
          okText="确定"
          cancelText="取消"
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              name="name"
              label="模板名称"
              rules={[{ required: true, message: '请输入模板名称' }]}
            >
              <Input placeholder="请输入模板名称" />
            </Form.Item>

            <Form.Item
              name="description"
              label="描述"
            >
              <Input.TextArea
                rows={4}
                placeholder="请输入模板描述"
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default TemplateManagePage;