import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Post {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  created_at: string;
}

export default function CommunityInspirations() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    supabase
      .from("inspiration_posts")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => setPosts(data || []));
  }, []);

  if (posts.length === 0) {
    return (
      <div className="rounded-xl bg-card p-6 text-center text-sm text-muted-foreground">
        Binnenkort verschijnt hier inspiratie van De Garengarage.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <div key={post.id} className="rounded-xl bg-card shadow-sm border border-border overflow-hidden">
          {post.image_url && (
            <img src={post.image_url} alt={post.title} className="w-full h-48 object-cover" />
          )}
          <div className="p-4">
            <h3 className="font-medium text-sm">{post.title}</h3>
            <p className="text-xs text-muted-foreground mt-1">{post.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
