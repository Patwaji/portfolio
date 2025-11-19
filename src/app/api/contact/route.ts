import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, email, subject, message } = body;

        // Validate the data
        if (!name || !email || !subject || !message) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            );
        }

        // Here you can integrate with an email service like:
        // - Resend (resend.com)
        // - SendGrid
        // - Nodemailer with SMTP
        // - Email.js
        
        // For now, we'll send to a webhook or log it
        // You can replace this with your email service
        
        // Example: Send to your email using a webhook service like Formspree or similar
        const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name,
                email,
                subject,
                message,
                _replyto: email,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to send email');
        }

        return NextResponse.json(
            { success: true, message: 'Email sent successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error sending email:', error);
        return NextResponse.json(
            { error: 'Failed to send email' },
            { status: 500 }
        );
    }
}
