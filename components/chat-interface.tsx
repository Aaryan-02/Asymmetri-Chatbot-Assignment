"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { useChat } from "@ai-sdk/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Loader2, Send, Download, Copy, Sparkles, Code2, Eye, ExternalLink, LogOut } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { signOut } from "next-auth/react"

interface ChatInterfaceProps {
  userId: string
  initialMessages: any[]
}

export default function ChatInterface({ userId, initialMessages }: ChatInterfaceProps) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("chat")
  const [generatedCode, setGeneratedCode] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)
  const previewRef = useRef<HTMLIFrameElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const updatePreview = useCallback(
    (code: string) => {
      if (!code) return

      if (activeTab === "preview" && previewRef.current) {
        try {
          const iframe = previewRef.current
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document

          if (iframeDoc) {
            iframeDoc.open()
            iframeDoc.write(code)
            iframeDoc.close()
          }
        } catch (error) {
          console.error("Error updating preview:", error)
        }
      }
    },
    [activeTab],
  )

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    initialMessages,
    api: "/api/chat",
    onError: (error) => {
      setIsGenerating(false)
      console.error("Chat error:", error)

      let errorMessage = "Failed to generate response. Please try again."
      let errorTitle = "Error"

      if (error.message.includes("quota") || error.message.includes("billing")) {
        errorTitle = "API Quota Exceeded"
        errorMessage =
          "You've exceeded your OpenAI API quota. Please check your billing details at platform.openai.com or try using Groq API (free alternative)."
      } else if (error.message.includes("API key")) {
        errorTitle = "API Key Issue"
        errorMessage =
          "AI API key is not configured. Please add either GROQ_API_KEY (free) or OPENAI_API_KEY environment variable."
      } else if (error.message.includes("rate limit")) {
        errorMessage = "Rate limit exceeded. Please wait a moment and try again."
      } else if (error.message.includes("network")) {
        errorMessage = "Network error. Please check your connection and try again."
      }

      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      })
    },
    onFinish: async (message) => {
      setIsGenerating(false)
      const codeMatch = message.content.match(/```html\n([\s\S]*?)\n```/)
      if (codeMatch && codeMatch[1]) {
        setGeneratedCode(codeMatch[1])

        // Smooth transition to preview
        setTimeout(() => {
          setActiveTab("preview")
        }, 300)

        try {
          await fetch("/api/chat/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId,
              messages: [...messages, message],
            }),
          })
        } catch (error) {
          console.error("Failed to save chat history:", error)
        }
      }
    },
  })

  // Custom submit handler for smooth transitions
  const handleCustomSubmit = (e: React.FormEvent) => {
    setIsGenerating(true)
    handleSubmit(e)
  }

  useEffect(() => {
    if (activeTab === "preview" && generatedCode) {
      const timer = setTimeout(() => {
        updatePreview(generatedCode)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [activeTab, generatedCode, updatePreview])

  const downloadCode = () => {
    if (!generatedCode) return

    const blob = new Blob([generatedCode], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "landing-page.html"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Downloaded!",
      description: "Your HTML file has been downloaded.",
    })
  }

  const copyCode = () => {
    if (!generatedCode) return

    navigator.clipboard.writeText(generatedCode)
    toast({
      title: "Copied!",
      description: "Code copied to clipboard.",
    })
  }

  const openInNewTab = () => {
    if (!generatedCode) return

    const blob = new Blob([generatedCode], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const newWindow = window.open(url, "_blank")

    if (newWindow) {
      // Clean up the blob URL after the window loads
      newWindow.addEventListener("load", () => {
        setTimeout(() => {
          URL.revokeObjectURL(url)
        }, 1000)
      })

      toast({
        title: "Opened in new tab!",
        description: "Your landing page is now open in a new tab.",
      })
    } else {
      toast({
        title: "Popup blocked",
        description: "Please allow popups for this site to open in new tab.",
        variant: "destructive",
      })
    }
  }

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: "/" })
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleIframeLoad = useCallback(() => {
    if (generatedCode && activeTab === "preview") {
      updatePreview(generatedCode)
    }
  }, [generatedCode, activeTab, updatePreview])

  return (
    <div className="flex flex-col md:flex-row w-full h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="w-full md:w-1/2 h-full flex flex-col border-r border-slate-200/60 backdrop-blur-sm">
        <div className="p-6 border-b border-slate-200/60 bg-white/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  AI Landing Page Generator
                </h1>
                <p className="text-sm text-slate-500">Describe the landing page you want to create</p>
              </div>
            </div>

            {/* Logout Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="rounded-lg border-slate-200/60 bg-white/80 backdrop-blur-sm hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all duration-200"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-2 duration-300`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 shadow-sm transition-all duration-200 hover:shadow-md ${
                  message.role === "user"
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                    : "bg-white/80 backdrop-blur-sm text-slate-900 border border-slate-200/60"
                }`}
              >
                <div className="prose prose-sm max-w-none">
                  {message.content.replace(/```html\n[\s\S]*?\n```/g, "✨ HTML Code Generated")}
                </div>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isGenerating && (
            <div className="flex justify-start animate-in slide-in-from-bottom-2 duration-300">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-slate-200/60 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                  <span className="text-sm text-slate-600">Generating your landing page...</span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="flex justify-start animate-in slide-in-from-bottom-2 duration-300">
              <div className="max-w-[85%] rounded-2xl p-4 bg-red-50 text-red-900 border border-red-200 shadow-sm">
                <p className="font-medium">Error occurred:</p>
                <p className="text-sm">{error.message}</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-6 border-t border-slate-200/60 bg-white/80 backdrop-blur-sm">
          <form onSubmit={handleCustomSubmit} className="flex gap-3">
            <div className="flex-1 relative">
              <Input
                value={input}
                onChange={handleInputChange}
                placeholder="Describe your landing page..."
                disabled={isLoading}
                className="pr-12 h-12 rounded-xl border-slate-200/60 bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Sparkles className="h-4 w-4 text-slate-400" />
              </div>
            </div>
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="h-12 px-6 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </div>
      </div>

      <div className="w-full md:w-1/2 h-full flex flex-col bg-white/60 backdrop-blur-sm">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
          {/* Tab Header */}
          <div className="p-6 border-b border-slate-200/60 bg-white/80 backdrop-blur-sm flex justify-between items-center flex-shrink-0">
            <TabsList className="bg-slate-100/80 backdrop-blur-sm border border-slate-200/60 rounded-xl p-1">
              <TabsTrigger
                value="preview"
                className="rounded-lg px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200"
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </TabsTrigger>
              <TabsTrigger
                value="code"
                className="rounded-lg px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200"
              >
                <Code2 className="h-4 w-4 mr-2" />
                Code
              </TabsTrigger>
            </TabsList>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={openInNewTab}
                disabled={!generatedCode}
                className="rounded-lg border-slate-200/60 bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-200"
              >
                <ExternalLink className="h-4 w-4 mr-2" /> Open in New Tab
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={copyCode}
                disabled={!generatedCode}
                className="rounded-lg border-slate-200/60 bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-200"
              >
                <Copy className="h-4 w-4 mr-2" /> Copy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadCode}
                disabled={!generatedCode}
                className="rounded-lg border-slate-200/60 bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-200"
              >
                <Download className="h-4 w-4 mr-2" /> Download
              </Button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            <TabsContent value="preview" className="h-full m-0 p-0 transition-all duration-300">
              {generatedCode ? (
                <div className="h-full relative">
                  <iframe
                    ref={previewRef}
                    className="w-full h-full border-0 transition-opacity duration-300"
                    title="Preview"
                    sandbox="allow-same-origin allow-scripts"
                    onLoad={handleIframeLoad}
                  />
                  <div className="absolute top-4 right-6 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1 text-xs text-slate-600 border border-slate-200/60">
                    Live Preview
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full bg-gradient-to-br from-slate-50 to-blue-50">
                  <Card className="p-8 text-center bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
                    <div className="p-4 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <Eye className="h-8 w-8" />
                    </div>
                    <p className="text-slate-700 font-medium mb-2">Your generated landing page will appear here</p>
                    <p className="text-sm text-slate-500">
                      Try asking for a landing page for a specific business or product
                    </p>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="code" className="h-full m-0 p-0 transition-all duration-300">
              {generatedCode ? (
                <div className="h-full relative">
                  <Textarea
                    value={generatedCode}
                    readOnly
                    className="h-full w-full font-mono text-sm p-6 resize-none rounded-none border-0 focus:ring-0 bg-slate-900 text-green-400 transition-all duration-300"
                    style={{
                      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    }}
                  />
                  <div className="absolute top-4 right-4 bg-slate-800/90 backdrop-blur-sm rounded-lg px-3 py-1 text-xs text-green-400 border border-slate-700">
                    HTML/CSS
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full bg-gradient-to-br from-slate-900 to-slate-800">
                  <Card className="p-8 text-center bg-slate-800/80 backdrop-blur-sm border-slate-700 shadow-lg">
                    <div className="p-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <Code2 className="h-8 w-8" />
                    </div>
                    <p className="text-slate-200 font-medium mb-2">Generated HTML & CSS code will appear here</p>
                    <p className="text-sm text-slate-400">Clean, modern code ready to use</p>
                  </Card>
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
