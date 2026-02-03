import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

const WrittenTest = () => {
    const { API_URL } = useAuth();
    const navigate = useNavigate();
    const [content, setContent] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!content.trim()) return;
        setSubmitting(true);
        try {
            const token = localStorage.getItem('trainerToken');

            // Save Written Content
            await axios.post(`${API_URL}/exam/written/submit`, {
                content
            }, { headers: { Authorization: `Bearer ${token}` } });

            // Final Submit
            await axios.post(`${API_URL}/exam/submit`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Redirect to a Thank You / Status page (reusing Instructions or new page)
            // For now, back to Instructions which might show "Pending" status
            alert("Exam Submitted Successfully!");
            navigate('/exam/status'); // Need to create this or handle in instructions
        } catch (error) {
            console.error("Submission failed", error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-3xl">
                <CardHeader>
                    <CardTitle>Round 4: Written Test</CardTitle>
                    <CardDescription>
                        Explain your teaching methodology or write a short essay on the given topic.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Label>Your Answer</Label>
                    <textarea
                        className="flex min-h-[300px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Type your answer here..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                </CardContent>
                <CardFooter className="justify-end">
                    <Button onClick={handleSubmit} disabled={submitting}>
                        {submitting ? 'Submitting...' : 'Finish Exam'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default WrittenTest;
