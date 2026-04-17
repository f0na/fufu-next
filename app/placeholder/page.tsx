import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function PlaceholderPage() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4">
      <div className="text-center">
        {/* 标题 */}
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
          页面建设中
        </h1>

        {/* 描述 */}
        <p className="mt-4 text-lg text-muted-foreground">
          该页面正在建设中，敬请期待
        </p>

        {/* 返回首页按钮 */}
        <Button asChild className="mt-8">
          <Link href="/">
            返回首页
          </Link>
        </Button>
      </div>
    </div>
  )
}