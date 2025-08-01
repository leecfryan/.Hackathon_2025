import React, { useState } from "react";
import Button from "../Button/Button";
import styles from "./CreatePost.module.css";

const CreatePost = ({ user, onPost }) => {
  const [postContent, setPostContent] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (postContent.trim()) {
      onPost(postContent);
      setPostContent("");
      setIsExpanded(false);
    }
  };

  return (
    <div className={styles.createPost}>
      <div className={styles.postHeader}>
        <div className={styles.userAvatar}>
          {user?.firstName?.charAt(0)}
          {user?.lastName?.charAt(0)}
        </div>
        <div className={styles.postInput}>
          <textarea
            placeholder={`What's on your mind, ${user?.firstName}?`}
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            className={`${styles.textarea} ${
              isExpanded ? styles.expanded : ""
            }`}
            rows={isExpanded ? 4 : 1}
          />
        </div>
      </div>

      {isExpanded && (
        <div className={styles.postActions}>
          <div className={styles.postOptions}>
            <button className={styles.optionButton}>📷 Photo</button>
            <button className={styles.optionButton}>📊 Poll</button>
            <button className={styles.optionButton}>📅 Event</button>
          </div>

          <div className={styles.postButtons}>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsExpanded(false);
                setPostContent("");
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              onClick={handleSubmit}
              disabled={!postContent.trim()}
            >
              Post
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatePost;
