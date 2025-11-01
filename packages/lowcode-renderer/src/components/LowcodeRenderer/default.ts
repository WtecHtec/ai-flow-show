import { PackageInfo } from './types';

export const defaultPackages: PackageInfo[] = [
  {
    package: "moment",
    version: "2.24.0",
    urls: [
      "https://g.alicdn.com/mylib/moment/2.24.0/min/moment.min.js"
    ],
    library: "moment"
  },
  {
    package: "lodash",
    library: "_",
    urls: [
      "https://g.alicdn.com/platform/c/lodash/4.6.1/lodash.min.js"
    ]
  },
  {
    title: "fusion组件库",
    package: "@alifd/next",
    version: "1.26.4",
    urls: [
      "https://g.alicdn.com/code/lib/alifd__next/1.26.4/next.min.css",
      "https://g.alicdn.com/code/lib/alifd__next/1.26.4/next-with-locales.min.js"
    ],
    library: "Next"
  },
  {
    title: "NextTable",
    package: "NextTable",
    version: "1.0.1",
    urls: [
      "https://g.alicdn.com/fusion-platform/pro-table/1.0.1/next-table.js",
      "https://g.alicdn.com/fusion-platform/pro-table/1.0.1/next-table.css"
    ],
    library: "NextTable"
  },
  {
    package: "@alilc/lowcode-materials",
    version: "1.0.7",
    library: "AlilcLowcodeMaterials",
    urls: [
      "https://alifd.alicdn.com/npm/@alilc/lowcode-materials@1.0.7/dist/AlilcLowcodeMaterials.js",
      "https://alifd.alicdn.com/npm/@alilc/lowcode-materials@1.0.7/dist/AlilcLowcodeMaterials.css"
    ],
    editUrls: [
      "https://alifd.alicdn.com/npm/@alilc/lowcode-materials@1.0.7/build/lowcode/view.js",
      "https://alifd.alicdn.com/npm/@alilc/lowcode-materials@1.0.7/build/lowcode/view.css"
    ]
  },
  {
    package: "@alifd/layout",
    version: "2.4.1",
    library: "AlifdLayout",
    urls: [
      "https://alifd.alicdn.com/npm/@alifd/layout@2.4.1/dist/AlifdLayout.js",
      "https://alifd.alicdn.com/npm/@alifd/layout@2.4.1/dist/AlifdLayout.css"
    ],
    editUrls: [
      "https://alifd.alicdn.com/npm/@alifd/layout@2.4.1/build/lowcode/view.js",
      "https://alifd.alicdn.com/npm/@alifd/layout@2.4.1/build/lowcode/view.css"
    ]
  },
  {
    package: "@alifd/fusion-ui",
    version: "2.0.2",
    library: "AlifdFusionUi",
    urls: [
      "https://alifd.alicdn.com/npm/@alifd/fusion-ui@2.0.2/dist/AlifdFusionUi.js",
      "https://alifd.alicdn.com/npm/@alifd/fusion-ui@2.0.2/dist/AlifdFusionUi.css"
    ],
    editUrls: [
      "https://alifd.alicdn.com/npm/@alifd/fusion-ui@2.0.2/build/lowcode/view.js",
      "https://alifd.alicdn.com/npm/@alifd/fusion-ui@2.0.2/build/lowcode/view.css"
    ]
  }
];