"use client"

import { useEffect, useState } from "react"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const [theme, setTheme] = useState<ToasterProps["theme"]>("dark")

  useEffect(() => {
    const el = document.documentElement
    const dataTheme = el.getAttribute("data-theme")
    if (dataTheme === "light") {
      setTheme("light")
    } else {
      setTheme("dark")
    }
    // Observe theme changes
    const observer = new MutationObserver(() => {
      const t = el.getAttribute("data-theme")
      setTheme(t === "light" ? "light" : "dark")
    })
    observer.observe(el, { attributes: true, attributeFilter: ["data-theme"] })
    return () => observer.disconnect()
  }, [])

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--arena-card)",
          "--normal-text": "var(--arena-text-primary)",
          "--normal-border": "var(--arena-border)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
