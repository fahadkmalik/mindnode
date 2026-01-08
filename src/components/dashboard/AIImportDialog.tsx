import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, Copy, Check, Upload, Sparkles } from "lucide-react";
import { AI_PROMPT_TEMPLATE, parseAndLayoutPlan } from "@/lib/ai-importer";
import { useBoardStore } from "@/store/useBoardStore";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

export function AIImportDialog() {
    const { createBoard, updateBoard } = useBoardStore();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [jsonInput, setJsonInput] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const handleCopyPrompt = () => {
        navigator.clipboard.writeText(AI_PROMPT_TEMPLATE.trim());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleImport = () => {
        try {
            setError(null);
            // Sanitize input: Remove markdown code blocks if present
            const sanitizedInput = jsonInput
                .replace(/^```json\s*/, "") // Remove starting ```json
                .replace(/^```\s*/, "")     // Remove starting ```
                .replace(/\s*```$/, "")     // Remove ending ```
                .trim();

            const { boardName, nodes, connections } = parseAndLayoutPlan(sanitizedInput);

            // Create and Hydrate Board
            const boardId = createBoard(boardName, "Imported from AI Plan");
            updateBoard(boardId, { nodes, connections });

            setIsOpen(false);
            navigate(`/board/${boardId}`);
        } catch (err: any) {
            setError(err.message || "Failed to parse plan");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Sparkles className="h-4 w-4 text-purple-500" />
                    Import AI Plan
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Bot className="h-5 w-5 text-purple-500" />
                        AI Plan Importer
                    </DialogTitle>
                    <DialogDescription>
                        Generate a plan with ChatGPT/Claude and import it here.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="generate" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="generate">1. Generate</TabsTrigger>
                        <TabsTrigger value="import">2. Import</TabsTrigger>
                    </TabsList>

                    <TabsContent value="generate" className="space-y-4 py-4">
                        <div className="rounded-md bg-muted p-4 text-sm text-muted-foreground">
                            <p className="mb-2 font-medium text-foreground">How it works:</p>
                            <ol className="list-decimal list-inside space-y-1">
                                <li>Copy the system prompt below.</li>
                                <li>Paste it into ChatGPT, Claude, or Gemini.</li>
                                <li>Ask it to generate a plan for your specific goal.</li>
                                <li>Copy the JSON response code block.</li>
                            </ol>
                        </div>

                        <div className="relative">
                            <div className="absolute right-2 top-2">
                                <Button size="sm" variant="ghost" className="h-8 gap-1" onClick={handleCopyPrompt}>
                                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                    {copied ? "Copied" : "Copy Prompt"}
                                </Button>
                            </div>
                            <pre className="h-[200px] w-full overflow-auto rounded-md border bg-slate-950 p-4 text-xs text-slate-50 font-mono">
                                {AI_PROMPT_TEMPLATE.trim()}
                            </pre>
                        </div>
                    </TabsContent>

                    <TabsContent value="import" className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Paste JSON Response</Label>
                            <Textarea
                                placeholder='{ "title": "My Plan", "nodes": [...] }'
                                className={cn("font-mono text-xs h-[200px]", error && "border-destructive focus-visible:ring-destructive")}
                                value={jsonInput}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setJsonInput(e.target.value)}
                            />
                            {error && <p className="text-xs text-destructive font-medium">{error}</p>}
                        </div>
                        <Button className="w-full" onClick={handleImport} disabled={!jsonInput.trim()}>
                            <Upload className="h-4 w-4 mr-2" />
                            Parse & Create Board
                        </Button>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}

function Label({ children }: { children: React.ReactNode }) {
    return <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{children}</label>;
}
