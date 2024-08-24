import React, { useEffect, useState, useCallback, useRef } from "react";
import AlbumCard from "@/components/ui/album";
import Spinner from "@/components/ui/spinner";

export default function Albums() {
  const [albums, setAlbums] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();

  const loadAlbums = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      const newAlbums = await window.ipc.invoke("getAlbums", page);
      if (newAlbums.length === 0) {
        setHasMore(false);
      } else {
        setAlbums((prevAlbums) => [...prevAlbums, ...newAlbums]);
        setPage((prevPage) => prevPage + 1);
      }
    } catch (error) {
      console.error("Error loading albums:", error);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore]);

  useEffect(() => {
    loadAlbums(); // Load initial albums
  }, []); // Empty dependency array ensures this only runs once on mount

  const lastAlbumElementRef = useCallback(
    (node) => {
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadAlbums();
        }
      });
      if (node) observer.current.observe(node);
    },
    [loadAlbums, hasMore, loading],
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col">
          <div className="mt-4 text-base font-medium">Albums</div>
          <div className="opacity-50">All of your albums in one place.</div>
        </div>
        <div className="grid w-full grid-cols-5 gap-8">
          {albums.map((album, index) => (
            <div
              key={album.id}
              ref={index === albums.length - 1 ? lastAlbumElementRef : null}
            >
              <AlbumCard album={album} />
            </div>
          ))}
        </div>
        {loading && (
          <div className="flex w-full items-center justify-center">
            <Spinner className="h-6 w-6" />
          </div>
        )}
      </div>
    </div>
  );
}
