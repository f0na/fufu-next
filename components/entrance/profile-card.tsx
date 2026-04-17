import Image from 'next/image'
import { cn } from '@/lib/utils'
import { SiBilibili, SiGithub } from 'react-icons/si'
import { MdEmail } from 'react-icons/md'

interface ProfileCardProps {
  name?: string
  avatar_url?: string
  greeting?: string
  social_links?: {
    bilibili?: string
    github?: string
    email?: string
  }
  className?: string
}

const default_profile = {
  name: 'Fufu',
  avatar_url: 'https://www.loliapi.com/acg/pp/',
  greeting: 'Ciallo～(∠・ω< )⌒★',
  social_links: {
    bilibili: 'https://space.bilibili.com/',
    github: 'https://github.com/',
    email: 'mailto:example@email.com',
  },
}

export function ProfileCard({
  name = default_profile.name,
  avatar_url = default_profile.avatar_url,
  greeting = default_profile.greeting,
  social_links = default_profile.social_links,
  className,
}: ProfileCardProps) {
  return (
    <div
      className={cn(
        'bg-card/80 backdrop-blur-sm rounded-xl p-2 border border-border flex flex-col items-center gap-1 w-[140px]',
        className
      )}
    >
      {/* 头像 */}
      <div className="w-full aspect-square rounded-lg overflow-hidden">
        <Image
          src={avatar_url}
          alt="头像"
          width={140}
          height={140}
          className="object-cover w-full h-full"
          unoptimized
        />
      </div>
      <span className="text-foreground font-medium text-sm">{name}</span>
      <span className="text-muted-foreground text-xs text-center">{greeting}</span>
      {/* 社交链接 - 统一图标样式 */}
      <div className="flex gap-2">
        {social_links.bilibili && (
          <a
            href={social_links.bilibili}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-md bg-muted hover:bg-muted/80 transition-colors text-foreground"
          >
            <SiBilibili className="w-3.5 h-3.5" />
          </a>
        )}
        {social_links.github && (
          <a
            href={social_links.github}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-md bg-muted hover:bg-muted/80 transition-colors text-foreground"
          >
            <SiGithub className="w-3.5 h-3.5" />
          </a>
        )}
        {social_links.email && (
          <a
            href={social_links.email}
            className="p-1.5 rounded-md bg-muted hover:bg-muted/80 transition-colors text-foreground"
          >
            <MdEmail className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  )
}