'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, MessageSquare, Share2, Filter, BrainCircuit, Github, Code } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface Post {
  id: string;
  author: string;
  title: string; // Added title field
  content: string;
  timestamp: string;
  likes: number;
  comments: Comment[];
  tags: string[];
}

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
}

function generateRandomId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostTitle, setNewPostTitle] = useState(""); // State for post title
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostTags, setNewPostTags] = useState("");
  const [searchText, setSearchText] = useState("");
	const { toast } = useToast()
  const [userCount, setUserCount] = useState(1);

  // Load posts from local storage on component mount
  useEffect(() => {
    const storedPosts = localStorage.getItem('posts');
    if (storedPosts) {
      setPosts(JSON.parse(storedPosts));
    } else {
      // Mock data for initial posts if no data in local storage
      const initialPosts: Post[] = [
        {
          id: generateRandomId(),
          author: "Zenith User 1",
          title: "Welcome to Discussions!", // Added title
          content: "First post! Welcome to Discussions!",
          timestamp: new Date().toISOString(),
          likes: 0,
          comments: [],
          tags: ["welcome", "first"],
        },
        {
          id: generateRandomId(),
          author: "Zenith User 2",
          title: "Latest Tech Trends", // Added title
          content: "Sharing my thoughts on the latest tech trends.",
          timestamp: new Date().toISOString(),
          likes: 2,
          comments: [
            {
              id: generateRandomId(),
              author: "Zenith User 3",
              content: "Interesting!",
              timestamp: new Date().toISOString(),
            },
          ],
          tags: ["tech", "trends"],
        },
      ];
      setPosts(initialPosts);
      localStorage.setItem('posts', JSON.stringify(initialPosts));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('posts', JSON.stringify(posts));
  }, [posts]);

  const handleCreatePost = () => {
    if (newPostTitle.trim() === "") {
			toast({
				title: "Error",
				description: "Post title cannot be empty.",
				variant: "destructive",
			})
			return;
		}

    if (newPostContent.trim() === "") {
			toast({
				title: "Error",
				description: "Post content cannot be empty.",
				variant: "destructive",
			})
			return;
		}


    const tagsArray = newPostTags.split(",").map((tag) => tag.trim());
    const author = `Zenith User ${userCount}`;
    setUserCount(userCount + 1);

    const newPost: Post = {
      id: generateRandomId(),
      author: author,
      title: newPostTitle, // Assign title
      content: newPostContent,
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: [],
      tags: tagsArray,
    };

    setPosts([newPost, ...posts]);
    setNewPostTitle(""); // Clear title input
    setNewPostContent("");
    setNewPostTags("");
  };

  const handleLikePost = (postId: string) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      )
    );
  };

  const handleAddComment = (postId: string, commentContent: string) => {
    if (commentContent.trim() === "") return;

    const newComment: Comment = {
      id: generateRandomId(),
      author: `Zenith User ${userCount}`,
      content: commentContent,
      timestamp: new Date().toISOString(),
    };
    setUserCount(userCount + 1);

    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id === postId) {
          const updatedPost = {
            ...post,
            comments: [...post.comments, newComment],
          };

          return updatedPost;
        }
        return post;
      })
    );
  };

  const handleSharePost = (postId: string) => {
    const post = posts.find(post => post.id === postId);
    if (!post) {
      toast({
        title: "Error",
        description: "Post not found for sharing.",
        variant: "destructive",
      });
      return;
    }

    const textToCopy = `${post.title}\n${post.content}`;
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        toast({
          description: "Post title and content copied, hurray! 🥹",
        });
      })
      .catch(err => {
        toast({
          title: "Error",
          description: "Failed to copy post to clipboard.",
          variant: "destructive",
        });
        console.error("Could not copy text: ", err);
      });
  };

  const [commentInput, setCommentInput] = useState<Record<string, string>>({});

	// Load comment input from local storage
	useEffect(() => {
		const storedCommentInput = localStorage.getItem('commentInput');
		if (storedCommentInput) {
			setCommentInput(JSON.parse(storedCommentInput));
		}
	}, []);

	// Save comment input to local storage
	useEffect(() => {
		localStorage.setItem('commentInput', JSON.stringify(commentInput));
	}, [commentInput]);

  const handleCommentInputChange = (postId: string, content: string) => {
    setCommentInput((prev) => ({ ...prev, [postId]: content }));
  };

  const filteredPosts = searchText
    ? posts.filter((post) => {
        const searchTags = searchText.toLowerCase().split(',').map(tag => tag.trim());
        return searchTags.every(searchTag =>
          post.tags.some(tag => tag.toLowerCase().includes(searchTag))
        );
      })
    : posts;

  return (
    <div className="container mx-auto p-6 pt-2">
      <motion.h1
        className="text-3xl font-bold mb-5 text-center flex items-center justify-center text-primary"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <BrainCircuit className="h-6 w-6 mr-2" />
        Discussions
      </motion.h1>

      {/* GitHub Integration Banner */}
      <motion.div
        className="mb-6 text-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center space-x-2">
                <Github className="h-5 w-5 text-blue-600" />
                <span className="font-semibold">New: Lupin GitHub Integration</span>
              </div>
              <Button
                onClick={() => window.location.href = '/lupin'}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                size="sm"
              >
                <Code className="h-4 w-4 mr-2" />
                Try Lupin AI
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Chat with AI • GitHub Integration • SDE2+ Mode • Repository Management
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Banner Section */}
        <motion.div
          className="md:col-span-3 text-center py-4 bg-secondary rounded-md shadow-md fade-in mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <p className="text-secondary-foreground text-sm">
            Welcome to Zenith 🎉 ! Get solutions for your doubts and get productive today.
          </p>
        </motion.div>

        {/* Post Creation */}
        <motion.div
          className="md:col-span-1"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="mb-6 bg-white dark:bg-gray-800 shadow-md rounded-lg border-glow">
            <CardHeader className="flex flex-col space-y-2">
              <Label htmlFor="author">
                <div className="flex items-center space-x-2">
                  <BrainCircuit className="h-4 w-4" />
                  <span>Tags</span>
                </div>
              </Label>
              <Input
                id="author"
                type="text"
                value={newPostTags}
                onChange={(e) => setNewPostTags(e.target.value)}
                className="mb-3 rounded-md"
                placeholder="Tags (comma-separated)"
              />
            </CardHeader>
            <CardContent>
              <Label htmlFor="title">Post Title</Label>
              <Input
                id="title"
                type="text"
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
                className="mb-3 rounded-md"
                placeholder="Enter post title"
              />
              <Label htmlFor="content">Post Content</Label>
              <Textarea
                id="content"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="mb-3 rounded-md"
              />
              <Button
                onClick={handleCreatePost}
                className="bg-primary text-primary-foreground hover:bg-primary/80 rounded-md shadow-glow"
              >
                Create Post
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Post Display */}
        <motion.div
          className="md:col-span-2"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {/* Search Input */}
          <div className="relative mb-4">
            <Input
              type="text"
              placeholder="Search by tags..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="rounded-md pr-10 border-2"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <Filter className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>

          <div>
            <AnimatePresence>
              {filteredPosts.map((post) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card key={post.id} className="mb-6 bg-white dark:bg-gray-800 shadow-md rounded-lg border-glow">
                    <CardHeader className="flex flex-col">
                      <div className="flex items-center space-x-2">
                        <BrainCircuit className="h-4 w-4 mr-2" />
                        <span className="text-sm font-bold">Zenith User</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(post.timestamp), {
                          addSuffix: true,
                        })}
                        <br />
                        {format(new Date(post.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                      </div>
                      <div>
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center rounded-full bg-secondary px-3 py-1 mt-2 text-xs font-medium text-secondary-foreground mr-2"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <h2 className="text-xl font-bold mb-2">{post.title}</h2> {/* Display Post Title */}
                      <p className="mb-4">{post.content}</p>
                      <div className="flex items-center mt-4 rounded-md p-2 bg-gray-100 dark:bg-gray-700">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLikePost(post.id)}
                          className="mr-3 rounded-md shadow-glow"
                        >
                          <Heart className="h-4 w-4 mr-1" />
                          Like ({post.likes})
                        </Button>
                        <Button variant="ghost" size="sm" className="mr-3 rounded-md shadow-glow">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          {post.comments.length} Comments
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSharePost(post.id)}
                          className="rounded-md shadow-glow"
                        >
                          <Share2 className="h-4 w-4 mr-1" />
                          Share
                        </Button>
                      </div>

                      {/* Comments Section */}
                      <div className="mt-5">
                        <h3 className="text-sm font-bold mb-3">Comments</h3>
                        <AnimatePresence>
                          {post.comments.map((comment) => (
                            <motion.div
                              key={comment.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.1 }}
                              className="mb-3 p-3 rounded-md bg-muted shadow-glow"
                            >
                              <div className="flex items-center space-x-2">
                                <BrainCircuit className="h-4 w-4 mr-2" />
                                <span className="text-xs font-bold">Zenith User</span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(comment.timestamp), {
                                  addSuffix: true,
                                })}
                                  <br />
                                  {format(new Date(comment.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                              </div>
                              <p className="text-sm mt-1">{comment.content}</p>
                            </motion.div>
                          ))}
                        </AnimatePresence>

                        {/* Add Comment Input */}
                        <div className="mt-3">
                          <Textarea
                            value={commentInput[post.id] || ""}
                            onChange={(e) =>
                              handleCommentInputChange(post.id, e.target.value)
                            }
                            placeholder="Add a comment..."
                            className="mb-3 text-sm rounded-md"
                          />
                          <Button
                            onClick={() =>
                              handleAddComment(post.id, commentInput[post.id] || "")
                            }
                            className="bg-primary text-primary-foreground hover:bg-primary/80 rounded-md text-sm shadow-glow"
                            size="sm"
                          >
                            Add Comment
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

