import Image, { type ImageProps } from "next/image";
// 使用monorepo的 packages專案, 需要 @repo 來引入
// 在 tsconfig.json 有設定相關的 @repo 路徑, 所以引入code IDE 會有所提示
// package.json 載入相關自己本身 "@repo/ui": "workspace:*", 則是對應到 packages 目錄
// packages 目錄裡面有三個專案, eslint-config , typescript-config , ui
import { Button } from "@repo/ui/button";
import styles from "./page.module.css";
import { example } from "@repo/example";

import WebsiteBuilderEditor from "./builder/web-builder";

type Props = Omit<ImageProps, "src"> & {
  srcLight: string;
  srcDark: string;
};

const ThemeImage = (props: Props) => {
  const { srcLight, srcDark, ...rest } = props;

  console.log("example: ", example);
  return (
    <>
      <Image {...rest} src={srcLight} className="imgLight" />
      <Image {...rest} src={srcDark} className="imgDark" />
    </>
  );
};

export default function Home() {

  return <div className=" bg-yellow-600" id="archie-test2">
    
    <WebsiteBuilderEditor />
  
  </div> 
}
