import { useState } from "react";
import { cn } from "@/lib/utils";
import { useBoardStore } from "@/store/useBoardStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Search, Trash2, Star, Calendar } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { MobileNav } from "@/components/ui/mobile-nav";

export function Dashboard() {
    const { boards, createBoard, deleteBoard, toggleStarBoard } = useBoardStore();
    const [searchTerm, setSearchTerm] = useState("");
    const [newBoardName, setNewBoardName] = useState("");
    const [newBoardDesc, setNewBoardDesc] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const navigate = useNavigate();

    const filteredBoards = boards.filter(board =>
        board.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        board.description?.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => (b.starred ? 1 : 0) - (a.starred ? 1 : 0)); // Starred first

    const handleCreateBoard = () => {
        if (!newBoardName.trim()) return;
        const newId = createBoard(newBoardName, newBoardDesc);
        setNewBoardName("");
        setNewBoardDesc("");
        setIsDialogOpen(false);
        navigate(`/board/${newId}`);
    };

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <MobileNav />
                        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
                            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center text-primary-foreground text-xs font-bold">M</div>
                            MindNode
                        </h1>
                        <nav className="hidden md:flex items-center gap-4 ml-6 text-sm font-medium text-muted-foreground">
                            <Link to="/" className="text-foreground transition-colors hover:text-foreground">Dashboard</Link>
                            <Link to="/analytics" className="transition-colors hover:text-foreground">Analytics</Link>
                            <Link to="/calendar" className="transition-colors hover:text-foreground">Calendar</Link>
                            <Link to="/timeline" className="transition-colors hover:text-foreground">Timeline</Link>
                        </nav>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* More controls can go here */}
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search boards..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" /> New Board
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create New Board</DialogTitle>
                                <DialogDescription>Start a new visual planning project.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={newBoardName}
                                        onChange={(e) => setNewBoardName(e.target.value)}
                                        placeholder="Project Beta"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="desc">Description</Label>
                                    <Input
                                        id="desc"
                                        value={newBoardDesc}
                                        onChange={(e) => setNewBoardDesc(e.target.value)}
                                        placeholder="Q1 Roadmap planning..."
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleCreateBoard}>Create Board</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {filteredBoards.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground">
                        {searchTerm ? "No boards match your search." : "No boards created yet. Create one to get started!"}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredBoards.map(board => (
                            <Card key={board.id} className="group hover:shadow-lg transition-shadow relative">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <Link to={`/board/${board.id}`} className="hover:underline">
                                            <CardTitle>{board.name}</CardTitle>
                                        </Link>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-yellow-400"
                                            onClick={() => toggleStarBoard(board.id)}
                                        >
                                            <Star className={cn("h-4 w-4", board.starred && "fill-yellow-400 text-yellow-400")} />
                                        </Button>
                                    </div>
                                    <CardDescription className="line-clamp-1">{board.description || "No description"}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <div className="w-2 h-2 rounded-full bg-primary" />
                                            {board.nodes.length} Nodes
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {board.updatedAt && !isNaN(new Date(board.updatedAt).getTime())
                                                ? formatDistanceToNow(new Date(board.updatedAt), { addSuffix: true })
                                                : "Just now"}
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-end pt-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8"
                                        onClick={() => deleteBoard(board.id)}
                                    >
                                        <Trash2 className="h-3 w-3 mr-1" /> Delete
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
