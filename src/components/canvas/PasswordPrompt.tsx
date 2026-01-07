import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

interface PasswordPromptProps {
    onUnlock: () => void;
    correctPassword?: string;
}

export function PasswordPrompt({ onUnlock, correctPassword }: PasswordPromptProps) {
    const [password, setPassword] = useState("");
    const [error, setError] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === correctPassword) {
            onUnlock();
        } else {
            setError(true);
            setPassword("");
        }
    };

    return (
        <div className="h-screen w-screen flex items-center justify-center bg-background">
            <Card className="w-[350px]">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Lock className="h-5 w-5 text-primary" />
                        <CardTitle>Protected Board</CardTitle>
                    </div>
                    <CardDescription>Enter password to view this board.</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent>
                        <Input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError(false);
                            }}
                            className={error ? "border-destructive" : ""}
                        />
                        {error && <p className="text-destructive text-xs mt-2">Incorrect password</p>}
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full">Unlock</Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
