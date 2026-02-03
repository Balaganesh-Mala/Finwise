import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, File } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AssignmentUpload = () => {
    const { API_URL, user } = useAuth();
    const navigate = useNavigate();
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadedUrls, setUploadedUrls] = useState([]);

    // Check if already submitted
    useEffect(() => {
        const checkStatus = async () => {
            try {
                const token = localStorage.getItem('trainerToken');
                const res = await axios.get(`${API_URL}/exam/status`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.data && res.data.assignments && res.data.assignments.length > 0) {
                    navigate('/exam/written'); // Skip if already done
                }
            } catch (err) {
                console.error(err);
            }
        };
        checkStatus();
    }, []);

    const handleFileChange = async (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            const token = localStorage.getItem('trainerToken');
            const res = await axios.post(`${API_URL}/upload`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setUploadedUrls(prev => [...prev, res.data.url]);
            setFiles(prev => [...prev, selectedFile.name]);

        } catch (error) {
            console.error("Upload failed", error);
            toast.error("File upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleNext = async () => {
        try {
            const token = localStorage.getItem('trainerToken');
            await axios.post(`${API_URL}/exam/assignment/save`, {
                assignments: uploadedUrls
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Assignments submitted!");
            navigate('/exam/written');
        } catch (error) {
            console.error("Save failed", error);
            toast.error("Failed to submit assignments");
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle>Round 3: Assignments</CardTitle>
                    <CardDescription>
                        Please upload the required documents for your role ({user?.role || 'Trainer'}).
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="rounded-md bg-blue-50 p-4 text-blue-800 text-sm">
                        <h4 className="font-semibold mb-2">Assignment Task:</h4>
                        <p className="mb-3 text-lg">
                            {user?.hiringRounds?.assignment?.testId?.prompt || user?.hiringRounds?.assignment?.testId?.instructions || user?.hiringRounds?.assignment?.question || "Upload your Lesson Plan (PDF) and specific assignment files (Word/Excel)."}
                        </p>
                    </div>

                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="file">Upload File</Label>
                        <Input id="file" type="file" onChange={handleFileChange} disabled={uploading} />
                        {uploading && <p className="text-sm text-gray-500">Uploading...</p>}
                    </div>

                    <div className="space-y-2">
                        <h4 className="text-sm font-medium">Uploaded Files:</h4>
                        {files.length > 0 ? (
                            files.map((name, idx) => (
                                <div key={idx} className="flex items-center text-sm text-green-600 bg-green-50 p-2 rounded">
                                    <File className="mr-2 h-4 w-4" /> {name}
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-400">No files uploaded yet.</p>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="justify-end">
                    <Button onClick={handleNext} disabled={files.length === 0 || uploading}>
                        Next Step
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default AssignmentUpload;
