/**
 * @typedef {import("@/services/blog").BlogOut} BlogOut
 */

import type { BlogOut } from "@/services/blog";
import Image from "next/image";
import Card from "cmnjg-sb/dist/card";
import styles from "./Styles.module.css";

type BlogListItem = {
  popUp?: JSX.Element;
  blog: BlogOut;
};

const BlogListItem = ({ blog, popUp }: BlogListItem) => {
  return (
    <div className={styles.cardContainer} data-testid="blog-container">
      {popUp ? popUp : <></>}
      <Card
        date={blog["created_at"]}
        description={
          blog["short_desc"].slice(0, 55) +
          (blog["short_desc"].length > 54 ? "..." : "")
        }
        cardTitle={
          blog.title ? (
            blog.title.slice(0, 45) + (blog.title.length > 44 ? "..." : "")
          ) : (
            <em>Blog tidak berjudul</em>
          )
        }
        bannerElement={
          <Image
            src={
              blog["thumbnail_url"]
                ? blog["thumbnail_url"]
                : "/images/image/login-bg.svg"
            }
            priority={true}
            layout="fill"
            alt="Test"
          />
        }
      />
    </div>
  );
};

export default BlogListItem;
