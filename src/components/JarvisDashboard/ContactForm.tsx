'use client';

import React, { useState, useEffect } from 'react';
import { Send } from 'lucide-react';
import emailjs from '@emailjs/browser';

export default function ContactForm() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // Initialize EmailJS
    useEffect(() => {
        const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
        if (publicKey) {
            emailjs.init(publicKey);
            console.log('EmailJS initialized successfully');
        } else {
            console.error('EmailJS public key not found');
        }
    }, []);

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) newErrors.name = 'SENDER ID REQUIRED';
        if (!formData.email.trim()) newErrors.email = 'REPLY PATH REQUIRED';
        else if (!validateEmail(formData.email)) newErrors.email = 'INVALID REPLY PATH FORMAT';
        if (!formData.subject.trim()) newErrors.subject = 'QUERY TYPE REQUIRED';
        if (!formData.message.trim()) newErrors.message = 'DATA PACKET EMPTY';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Send email via EmailJS
        setIsSubmitting(true);
        try {
            // EmailJS credentials from environment variables
            const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
            const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
            const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

            // Debug: Check if credentials are loaded
            console.log('EmailJS Config:', {
                serviceId: serviceId ? 'Loaded' : 'Missing',
                templateId: templateId ? 'Loaded' : 'Missing',
                publicKey: publicKey ? 'Loaded' : 'Missing',
            });

            if (!serviceId || !templateId || !publicKey) {
                throw new Error('EmailJS credentials not configured. Please check .env.local file.');
            }

            const templateParams = {
                from_name: formData.name,
                from_email: formData.email,
                subject: formData.subject,
                message: formData.message,
                to_name: 'Suryansh Patwa',
            };

            console.log('Sending email with params:', templateParams);

            const response = await emailjs.send(serviceId, templateId, templateParams, publicKey);

            console.log('Email sent successfully:', response);

            setSubmitted(true);

            // Reset form after 3 seconds
            setTimeout(() => {
                setFormData({ name: '', email: '', subject: '', message: '' });
                setSubmitted(false);
            }, 3000);
        } catch (error: any) {
            console.error('Error sending email:', error);
            console.error('Error details:', {
                message: error.message,
                text: error.text,
                status: error.status,
            });
            setErrors({ submit: `TRANSMISSION FAILED: ${error.text || error.message || 'Unknown error'}` });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div className="space-y-2">
                <label className="text-cyan font-mono text-sm tracking-widest flex items-center gap-2">
                    SENDER IDENTIFICATION <span className="text-white/50">(Name):</span>
                </label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your Name"
                    className={`w-full bg-black/40 border ${errors.name ? 'border-red-500' : 'border-cyan/30'} rounded px-4 py-3 text-white placeholder-cyan/30 focus:outline-none focus:border-cyan focus:shadow-[0_0_10px_rgba(100,210,255,0.3)] transition-all`}
                />
                {errors.name && (
                    <p className="text-red-400 text-xs font-mono animate-pulse">{errors.name}</p>
                )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
                <label className="text-cyan font-mono text-sm tracking-widest flex items-center gap-2">
                    REPLY PATH <span className="text-white/50">(Email):</span>
                </label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    className={`w-full bg-black/40 border ${errors.email ? 'border-red-500' : 'border-cyan/30'} rounded px-4 py-3 text-white placeholder-cyan/30 focus:outline-none focus:border-cyan focus:shadow-[0_0_10px_rgba(100,210,255,0.3)] transition-all`}
                />
                {errors.email && (
                    <p className="text-red-400 text-xs font-mono animate-pulse">{errors.email}</p>
                )}
            </div>

            {/* Subject Field */}
            <div className="space-y-2">
                <label className="text-cyan font-mono text-sm tracking-widest flex items-center gap-2">
                    SUBJECT <span className="text-white/50">(Query Type):</span>
                </label>
                <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Project Inquiry / Collaboration / General"
                    className={`w-full bg-black/40 border ${errors.subject ? 'border-red-500' : 'border-cyan/30'} rounded px-4 py-3 text-white placeholder-cyan/30 focus:outline-none focus:border-cyan focus:shadow-[0_0_10px_rgba(100,210,255,0.3)] transition-all`}
                />
                {errors.subject && (
                    <p className="text-red-400 text-xs font-mono animate-pulse">{errors.subject}</p>
                )}
            </div>

            {/* Message Field */}
            <div className="space-y-2">
                <label className="text-cyan font-mono text-sm tracking-widest flex items-center gap-2">
                    MESSAGE <span className="text-white/50">(Data Packet):</span>
                </label>
                <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Enter your message here..."
                    className={`w-full bg-black/40 border ${errors.message ? 'border-red-500' : 'border-cyan/30'} rounded px-4 py-3 text-white placeholder-cyan/30 focus:outline-none focus:border-cyan focus:shadow-[0_0_10px_rgba(100,210,255,0.3)] transition-all resize-none`}
                />
                {errors.message && (
                    <p className="text-red-400 text-xs font-mono animate-pulse">{errors.message}</p>
                )}
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={isSubmitting || submitted}
                className={`w-full py-4 font-mono font-bold tracking-widest text-lg flex items-center justify-center gap-3 transition-all duration-300 relative overflow-hidden group ${submitted
                    ? 'bg-green-500/20 border-green-500 text-green-400'
                    : isSubmitting
                        ? 'bg-cyan/10 border-cyan text-cyan animate-pulse'
                        : 'bg-cyan/10 border-2 border-cyan text-cyan hover:bg-cyan hover:text-black'
                    }`}
            >
                {/* Particle effect on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-cyan rounded-full animate-ping" />
                </div>

                <Send size={20} className={isSubmitting ? 'animate-bounce' : ''} />
                <span className="relative z-10">
                    {submitted ? 'TRANSMISSION COMPLETE' : isSubmitting ? 'TRANSMITTING...' : 'TRANSMIT MESSAGE'}
                </span>
            </button>

            {/* Error message for submit */}
            {errors.submit && (
                <p className="text-red-400 text-sm font-mono animate-pulse text-center">{errors.submit}</p>
            )}
        </form>
    );
}
