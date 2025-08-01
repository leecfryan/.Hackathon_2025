import React, { useState } from "react";
import styles from "./PostCard.module.css";

const PostCard = ({ post }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);

  const handleLike = () => {
    if (liked) {
      setLikeCount(likeCount - 1);
    } else {
      setLikeCount(likeCount + 1);
    }
    setLiked(!liked);
  };

  return (
    <div className={styles.postCard}>
      <div className={styles.postHeader}>
        <div className={styles.authorInfo}>
          <div className={styles.authorAvatar}>{post.author.avatar}</div>
          <div className={styles.authorDetails}>
            <h4 className={styles.authorName}>{post.author.name}</h4>
            <p className={styles.authorMeta}>
              {post.author.university} • {post.author.faculty} •{" "}
              {post.timestamp}
            </p>
          </div>
        </div>
        <button className={styles.moreButton}>⋯</button>
      </div>

      <div className={styles.postContent}>
        <p className={styles.postText}>{post.content}</p>
        {post.image && (
          <div className={styles.postImage}>
            <img src={post.image} alt="Post content" />
          </div>
        )}
      </div>

      <div className={styles.postActions}>
        <button
          className={`${styles.actionButton} ${liked ? styles.liked : ""}`}
          onClick={handleLike}
        >
          <span className={styles.actionIcon}>{liked ? "❤️" : "🤍"}</span>
          <span className={styles.actionText}>{likeCount}</span>
        </button>

        <button className={styles.actionButton}>
          <span className={styles.actionIcon}>💬</span>
          <span className={styles.actionText}>{post.comments}</span>
        </button>

        <button className={styles.actionButton}>
          <span className={styles.actionIcon}>🔄</span>
          <span className={styles.actionText}>Share</span>
        </button>
      </div>
    </div>
  );
};

export default PostCard;
