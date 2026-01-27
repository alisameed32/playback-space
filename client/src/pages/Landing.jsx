import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Upload, Users, Shield, Github, Linkedin, Instagram, Facebook, ChevronDown, MonitorPlay, Zap, X, Check, ArrowRight, Video } from 'lucide-react';

const features = [
  { icon: MonitorPlay, title: "Ultra HD Streaming", desc: "Experience 4K HDR video playback with intelligent adaptive bitrate." },
  { icon: Upload, title: "Creators First", desc: "Advanced studio tools to manage, analyze, and monetize your content." },
  { icon: Users, title: "Community Driven", desc: "Engage with fans through real-time comments and community posts." },
  { icon: Shield, title: "Secure & Private", desc: "Enterprise-grade encryption keeps your data and content safe." },
];

const plans = [
    {
        name: "Viewer",
        price: "$0",
        period: "/forever",
        description: "For those who love to watch.",
        features: ["Unlimited 1080p Streaming", "Create Playlists", "Subscribe to Channels", "Ad-supported experience"],
        highlight: false,
        btnText: "Start Watching",
        btnLink: "/signup"
    },
    {
        name: "Creator",
        price: "$9.99",
        period: "/month",
        description: "For aspiring content creators.",
        features: ["Unlimited Uploads", "4K Video Support", "Advanced Analytics", "Monetization Tools", "Priority Support"],
        highlight: true,
        btnText: "Get Started",
        btnLink: "/signup"
    },
    {
        name: "Pro Studio",
        price: "$29.99",
        period: "/month",
        description: "For professional teams.",
        features: ["Everything in Creator", "Team Collaboration", "Custom Branding", "Live Streaming API", "Dedicated Manager"],
        highlight: false,
        btnText: "Contact Sales",
        btnLink: "/signup"
    }
];

const faqs = [
  { q: "Is PlaybackSpace completely free?", a: "Yes! Watching content is free. We also offer premium tools for creators who want to take their channel to the next level." },
  { q: "What makes this different from YouTube?", a: "PlaybackSpace is built with a focus on community and creator freedom, offering higher bitrate quality and better monetization shares." },
  { q: "Is this a real product?", a: "This is a high-fidelity portfolio project built by Ali Sameed using the MERN stack to demonstrate modern web development skills." },
  { q: "Can I upload my own videos?", a: "Absolutely! After signing up, you can access the Creator Studio to upload and manage your video content." },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
        opacity: 1,
        transition: { staggerChildren: 0.2 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const Landing = () => {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-purple-500 selection:text-white font-sans overflow-x-hidden">
      
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
             <div className="bg-gradient-to-tr from-purple-600 to-blue-500 p-1.5 rounded-lg group-hover:rotate-12 transition-transform">
                <Play fill="white" size={20} className="relative left-[1px]" />
             </div>
             <span className="font-bold text-xl tracking-tight">Playback<span className="text-purple-500">Space</span></span>
          </Link>
          <div className="hidden md:flex gap-8 text-sm font-medium text-gray-400">
             <a href="#features" className="hover:text-white transition">Features</a>
             <a href="#pricing" className="hover:text-white transition">Pricing</a>
             <a href="#faq" className="hover:text-white transition">FAQ</a>
          </div>
          <div className="flex gap-4">
            <Link to="/login" className="px-5 py-2.5 rounded-full font-medium text-sm text-gray-300 hover:text-white transition hover:bg-white/5">Log In</Link>
            <Link to="/signup" className="px-5 py-2.5 rounded-full font-medium text-sm bg-white text-black hover:bg-gray-200 transition shadow-[0_0_20px_rgba(255,255,255,0.3)]">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Modern Hero Section with 3D-ish Glow */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-purple-600/30 rounded-full blur-[120px] -z-10 mix-blend-screen animate-pulse"></div>
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] -z-10 mix-blend-screen"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
            <motion.div 
                className="text-center max-w-4xl mx-auto"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md">
                    <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-sm font-medium text-gray-300">v2.0 is now live</span>
                </motion.div>
                
                <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-8 leading-[1.1]">
                    The Future of <br />
                    <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent underline decoration-purple-500/30 decoration-wavy underline-offset-8">Video Streaming</span>
                </motion.h1>
                
                <motion.p variants={itemVariants} className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                    PlaybackSpace isn't just a platform; it's an ecosystem for creators and viewers. 
                    Upload, share, and monetize with zero friction.
                </motion.p>
                
                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link to="/signup" className="group relative px-8 py-4 bg-white text-black rounded-full font-bold text-lg overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.4)]">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                        <span className="relative flex items-center gap-2">Start Watching <ArrowRight size={20} /></span>
                    </Link>
                    <Link to="/login" className="px-8 py-4 bg-white/5 border border-white/10 rounded-full font-bold text-lg hover:bg-white/10 transition-all backdrop-blur-sm">
                        Creator Studio
                    </Link>
                </motion.div>
            </motion.div>

            {/* Dynamic Hero Visuals */}
            <motion.div 
                initial={{ opacity: 0, y: 100, rotateX: 20 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: 0.6, duration: 1, type: "spring" }}
                className="mt-20 perspective-1000 relative"
            >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto p-4 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm relative z-20 shadow-2xl">
                     {/* Fake Video Cards */}
                     {[1, 2, 3].map((i) => (
                        <div key={i} className={`rounded-xl overflow-hidden bg-gray-900 border border-white/5 shadow-lg ${i === 2 ? 'md:-mt-12 md:mb-12 ring-2 ring-purple-500' : 'opacity-75 scale-95'}`}>
                             <div className="aspect-video bg-gray-800 relative group cursor-pointer overflow-hidden">
                                  <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                  <img src={`https://picsum.photos/seed/${i + 130}/800/450`} alt="Thumbnail" className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 flex items-center justify-center">
                                      <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                                         <Play fill="white" size={20} />
                                      </div>
                                  </div>
                             </div>
                             <div className="p-4 space-y-2">
                                 <div className="h-4 bg-gray-800 rounded w-3/4"></div>
                                 <div className="h-3 bg-gray-800 rounded w-1/2"></div>
                             </div>
                        </div>
                     ))}
                </div>
                
                {/* Visual Glow behind cards */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-64 bg-purple-600/40 blur-[100px] -z-10"></div>
            </motion.div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-24 bg-zinc-950 border-t border-white/5">
         <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
                <h2 className="text-4xl font-bold mb-4">Why PlaybackSpace?</h2>
                <p className="text-gray-400">See the difference in quality and performance.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 bg-zinc-900/50 rounded-3xl p-8 md:p-12 border border-white/5">
                <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-gray-500">Other Platforms</h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 text-gray-500">
                             <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500"><X size={18} /></div>
                             <span>Aggressive compression (blocky video)</span>
                        </div>
                        <div className="flex items-center gap-4 text-gray-500">
                             <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500"><X size={18} /></div>
                             <span>High latency live streams</span>
                        </div>
                        <div className="flex items-center gap-4 text-gray-500">
                             <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500"><X size={18} /></div>
                             <span>Complex upload process</span>
                        </div>
                        <div className="mt-8 rounded-xl overflow-hidden grayscale opacity-50 border border-white/10">
                            <img src="https://picsum.photos/seed/pixel/600/300?blur=5" alt="Bad Quality" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </div>

                <div className="space-y-6 relative">
                    {/* Gradient Border Line */}
                    <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-purple-500 to-transparent hidden md:block -ml-6"></div>
                    
                    <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                        PlaybackSpace <span className="text-xs bg-purple-600 px-2 py-1 rounded text-white">PRO</span>
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                             <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400"><Check size={18} /></div>
                             <span>Crystal Clear 4K HDR</span>
                        </div>
                        <div className="flex items-center gap-4">
                             <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400"><Check size={18} /></div>
                             <span>Instant playback (Global CDN)</span>
                        </div>
                        <div className="flex items-center gap-4">
                             <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400"><Check size={18} /></div>
                             <span>Drag & Drop Uploads</span>
                        </div>
                        <div className="mt-8 rounded-xl overflow-hidden border border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                            <img src="https://picsum.photos/seed/hd/600/300" alt="High Quality" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </div>
            </div>
         </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-900/10 to-black"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">Simple, Transparent Pricing</h2>
                <p className="text-gray-400">Choose the plan that's right for your content journey.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 items-center max-w-6xl mx-auto">
                {plans.map((plan, idx) => (
                    <motion.div 
                        key={idx}
                        whileHover={{ y: -10 }}
                        className={`
                            relative p-8 rounded-3xl border backdrop-blur-xl
                            ${plan.highlight 
                            ? 'bg-zinc-900/80 border-purple-500 ring-4 ring-purple-500/20 z-10 md:scale-105' 
                            : 'bg-black/40 border-white/10'}
                        `}
                    >
                        {plan.highlight && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full text-xs font-bold uppercase tracking-wide">
                                Most Popular
                            </div>
                        )}
                        <h3 className="text-xl font-bold text-gray-300 mb-2">{plan.name}</h3>
                        <div className="flex items-baseline gap-1 mb-2">
                             <span className="text-4xl font-bold text-white">{plan.price}</span>
                             <span className="text-gray-500">{plan.period}</span>
                        </div>
                        <p className="text-sm text-gray-400 mb-6">{plan.description}</p>
                        
                        <Link to={plan.btnLink}>
                            <button className={`w-full py-3 rounded-xl font-bold mb-8 transition-colors ${plan.highlight ? 'bg-white text-black hover:bg-gray-200' : 'bg-white/10 hover:bg-white/20'}`}>
                                {plan.btnText}
                            </button>
                        </Link>

                        <div className="space-y-3">
                            {plan.features.map((feat, i) => (
                                <div key={i} className="flex items-center gap-3 text-sm text-gray-300">
                                    <Check size={16} className={plan.highlight ? 'text-purple-400' : 'text-gray-500'} />
                                    {feat}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
      </section>

      {/* Tech Stack / About Section */}
      <section className="py-24 bg-zinc-900/30 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div>
                     <span className="text-purple-400 font-bold tracking-wider text-sm uppercase mb-2 block">Developer Portfolio</span>
                     <h2 className="text-4xl font-bold mb-6">Designed & Developed by <br /> Ali Sameed</h2>
                     <p className="text-gray-400 mb-6 leading-relaxed">
                         This project represents a deep dive into modern full-stack development, utilizing the power of the MERN stack to deliver a seamless video streaming experience.
                     </p>
                     
                     <div className="grid grid-cols-2 gap-4 mb-8">
                         <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                             <h4 className="font-bold text-white mb-1">Frontend</h4>
                             <p className="text-sm text-gray-400">React, Tailwind, Framer Motion, Vite</p>
                         </div>
                         <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                             <h4 className="font-bold text-white mb-1">Backend</h4>
                             <p className="text-sm text-gray-400">Node.js, Express, MongoDB, Cloudinary</p>
                         </div>
                         <div className="p-4 bg-black/40 rounded-xl border border-white/5 col-span-2">
                             <h4 className="font-bold text-white mb-1">DevOps</h4>
                             <p className="text-sm text-gray-400">Jenkins, Kubernetes, AWS, Trivy, SonarQube, Docker</p>
                         </div>
                     </div>
                     
                     <a href="https://github.com/alisameed32/playback-space" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition font-medium">
                         View Source Code <ArrowRight size={16} />
                     </a>
                </div>
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/20 to-blue-600/20 rounded-full blur-3xl -z-10"></div>
                     <div className="grid grid-cols-2 gap-4">
                         {features.map((feature, idx) => (
                             <motion.div 
                                 key={idx}
                                 whileHover={{ y: -5 }}
                                 className="bg-zinc-900/80 backdrop-blur-sm border border-white/10 p-6 rounded-2xl hover:border-purple-500/50 transition-colors"
                             >
                                 <feature.icon className="w-10 h-10 text-purple-500 mb-4" />
                                 <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                                 <p className="text-xs text-gray-400 leading-relaxed">{feature.desc}</p>
                             </motion.div>
                         ))}
                     </div>
                </div>
            </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24">
        <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-4xl font-bold mb-12 text-center">Frequently Asked Questions</h2>
            <div className="space-y-4">
                {faqs.map((faq, idx) => (
                    <details key={idx} className="group bg-zinc-900/30 rounded-2xl overflow-hidden border border-white/5 open:bg-zinc-900/50 open:border-purple-500/30 transition-all duration-300">
                        <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                            <h3 className="text-lg font-medium pr-8">{faq.q}</h3>
                            <ChevronDown className="group-open:rotate-180 transition-transform text-gray-400 group-open:text-purple-500" />
                        </summary>
                        <div className="px-6 pb-6 text-gray-400 leading-relaxed border-t border-white/5 pt-4">
                            {faq.a}
                        </div>
                    </details>
                ))}
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-12 mb-16">
                <div className="col-span-1 md:col-span-2">
                    <Link to="/" className="flex items-center gap-2 mb-6">
                         <div className="bg-white p-1 rounded-md">
                             <Play fill="black" size={24} />
                         </div>
                         <span className="font-bold text-xl">PlaybackSpace</span>
                    </Link>
                    <p className="text-gray-400 max-w-sm">
                        PlaybackSpace is a cutting-edge video streaming platform project. 
                        Designed and developed with passion by Ali Sameed.
                    </p>
                </div>
                
                <div>
                    <h4 className="font-bold mb-6 text-white">Platform</h4>
                    <ul className="space-y-4 text-gray-400 text-sm">
                        <li><Link to="/feed" className="hover:text-purple-500 transition">Browse Content</Link></li>
                        <li><Link to="/login" className="hover:text-purple-500 transition">Creator Studio</Link></li>
                        <li><Link to="/signup" className="hover:text-purple-500 transition">Sign Up</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold mb-6 text-white">Connect</h4>
                    <div className="flex gap-4">
                        <a href="https://github.com/alisameed32" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-colors">
                            <Github size={18} />
                        </a>
                        <a href="https://linkedin.com/in/alisameed" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#0077b5] hover:text-white transition-colors">
                            <Linkedin size={18} />
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-gradient-to-tr hover:from-yellow-400 hover:via-red-500 hover:to-purple-600 hover:text-white transition-colors">
                            <Instagram size={18} />
                        </a>
                        <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#1877F2] hover:text-white transition-colors">
                            <Facebook size={18} />
                        </a>
                    </div>
                </div>
            </div>
            
            <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
                <p>&copy; 2026 Ali Sameed. All rights reserved.</p>
                <div className="flex gap-6 mt-4 md:mt-0">
                    <a href="#" className="hover:text-white transition">Privacy Policy</a>
                    <a href="#" className="hover:text-white transition">Terms of Service</a>
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
