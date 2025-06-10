'use client'

export function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          try {
            let isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
            let theme = localStorage.getItem('mingle-theme')
            
            if (theme === '"dark"' || (!theme && isDark)) {
              document.documentElement.classList.add('dark')
            } else {
              document.documentElement.classList.remove('dark')
            }
          } catch (e) {}
        `,
      }}
    />
  )
}

