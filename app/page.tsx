import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, Code2, Zap, Palette } from "lucide-react";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/chat");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="flex flex-col items-center justify-center min-h-screen px-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-4xl text-center space-y-8 relative z-10">
          <div className="flex justify-center mb-8 mt-2">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-2xl">
              <Sparkles className="h-12 w-12" />
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent leading-tight">
            Generate Landing Pages
            <span className="block text-4xl md:text-6xl mt-2">
              with AI Magic
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Create beautiful, responsive landing pages in minutes with our
            AI-powered code generator. Just describe what you want, and we'll
            generate clean HTML & CSS for you.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 mb-12">
            <div className="p-6 rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white w-fit mx-auto mb-4">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">
                Lightning Fast
              </h3>
              <p className="text-sm text-slate-600">
                Generate complete landing pages in seconds, not hours
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white w-fit mx-auto mb-4">
                <Palette className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">
                Modern Design
              </h3>
              <p className="text-sm text-slate-600">
                Beautiful, responsive designs that work on all devices
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white w-fit mx-auto mb-4">
                <Code2 className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Clean Code</h3>
              <p className="text-sm text-slate-600">
                Production-ready HTML & CSS with best practices
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button
              asChild
              size="lg"
              className="h-14 px-8 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <Link href="/signup">
                <Sparkles className="h-5 w-5 mr-2" />
                Get Started
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-14 px-8 rounded-xl border-slate-300 bg-white/80 backdrop-blur-sm hover:bg-white text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Link href="/login">Sign In</Link>
            </Button>
          </div>

          <div className="pt-12 pb-2">
            {/* <p className="text-sm text-slate-500 mb-4">Trusted by developers worldwide</p> */}
            <div className="flex justify-center items-center gap-8 opacity-60">
              <div className="text-2xl font-bold text-slate-400">AI</div>
              <div className="text-2xl font-bold text-slate-400">•</div>
              <div className="text-2xl font-bold text-slate-400">HTML</div>
              <div className="text-2xl font-bold text-slate-400">•</div>
              <div className="text-2xl font-bold text-slate-400">CSS</div>
              <div className="text-2xl font-bold text-slate-400">•</div>
              <div className="text-2xl font-bold text-slate-400">JS</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
