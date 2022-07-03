import type { ReactElement } from "react";
import { useState, Fragment } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  RiDraftLine,
  RiArrowDownSLine,
  RiArrowRightLine,
  RiDeleteBin6Line,
  RiFileSettingsLine,
} from "react-icons/ri";
import { debounce } from "@/lib/perf";
import Observe from "@/lib/use-observer";
import { useBlogsQuery, removeBlog } from "@/services/blog";
import { Popup, LinkButton, IconButton, Toast } from "cmnjg-sb";
import { useToast } from "@/components/toast";
import Modal from "@/layouts/modal";
import ToastComponent from "@/layouts/toastcomponent";
import AdminLayout from "@/layouts/adminpage";
import EmptyMsg from "@/layouts/emptymsg";
import BlogListItem from "@/layouts/bloglistitem";
import ErrMsg from "@/layouts/errmsg";
import styles from "./Styles.module.css";

const Blog = () => {
  const [blogId, setBlogId] = useState(0);
  const [isModalOpen, setModalOpen] = useState(false);

  const blogsQuery = useBlogsQuery("", {
    getPreviousPageParam: (firstPage) => firstPage.data.cursor || undefined,
    getNextPageParam: (lastPage) => lastPage.data.cursor || undefined,
  });

  const router = useRouter();
  const { toast, props } = useToast();

  const observeCallback = () => {
    if (blogsQuery.hasNextPage) {
      blogsQuery.fetchNextPage();
    }
  };

  const onDeleteBlog = (id: number) => {
    removeBlog(id)
      .then(() => {
        setBlogId(0);
        setModalOpen(false);
        blogsQuery.refetch();
      })
      .catch((e) => {
        toast({
          status: "error",
          render: () => <ToastComponent title="Error" message={e.message} />,
        });
      });
  };

  const onConfirmDelete = (id: number) => {
    setBlogId(id);
    setModalOpen(true);
  };

  /**
   * @return {void}
   */
  const onCancelDelete = () => {
    setBlogId(0);
    setModalOpen(false);
  };

  return (
    <>
      <Link href={`${router.pathname}/create`} passHref>
        <LinkButton
          colorScheme="green"
          leftIcon={<RiDraftLine />}
          className={styles.addBtn}
        >
          Buat
        </LinkButton>
      </Link>
      <h1 className={styles.pageTitle}>Blog</h1>
      <div className={styles.contentContainer}>
        {blogsQuery.isLoading ? (
          "Loading..."
        ) : blogsQuery.error ? (
          <ErrMsg />
        ) : blogsQuery.data?.pages[0].data.blogs.length === 0 ? (
          <EmptyMsg />
        ) : (
          blogsQuery.data?.pages.map((page) => {
            return (
              <Fragment key={page.data.cursor}>
                {page.data.blogs.map((blog) => {
                  return (
                    <BlogListItem
                      key={blog.id}
                      blog={blog}
                      popUp={
                        <Popup
                          popUpPosition="bottom-right"
                          className={styles.popup}
                          popUpContent={
                            <ul className={styles.addBtnOptions}>
                              <li data-testid="blog-detail-popup">
                                <Link
                                  href={{
                                    pathname: `${router.pathname}/view/[id]`,
                                    query: { id: blog.id },
                                  }}
                                >
                                  <a
                                    className={`${styles.addBtnOption} ${styles.optionLink}`}
                                  >
                                    <RiArrowRightLine />
                                    Lihat Detail
                                  </a>
                                </Link>
                              </li>
                              <li data-testid="blog-edit-popup">
                                <Link
                                  href={{
                                    pathname: `${router.pathname}/edit/[id]`,
                                    query: { id: blog.id },
                                  }}
                                >
                                  <a
                                    className={`${styles.addBtnOption} ${styles.optionLink}`}
                                  >
                                    <RiFileSettingsLine />
                                    Ubah
                                  </a>
                                </Link>
                              </li>
                              <li
                                onClick={() => onConfirmDelete(blog.id)}
                                className={`${styles.addBtnOption} ${styles.danger}`}
                                data-testid="blog-remove-popup"
                              >
                                <RiDeleteBin6Line />
                                Hapus
                              </li>
                            </ul>
                          }
                        >
                          <IconButton
                            className={styles.cardBtn}
                            data-testid="blog-popup-btn"
                          >
                            <RiArrowDownSLine />
                          </IconButton>
                        </Popup>
                      }
                    />
                  );
                })}
              </Fragment>
            );
          })
        )}
      </div>
      <Observe callback={debounce(observeCallback, 500)} />
      <Modal
        isOpen={isModalOpen}
        heading="Peringatan!"
        onCancel={() => onCancelDelete()}
        onConfirm={() => onDeleteBlog(blogId)}
      >
        <p>Apakah anda yakin ingin menghapus data yang dipilih?</p>
      </Modal>
      <Toast {...props} />
    </>
  );
};

Blog.getLayout = function getLayout(page: ReactElement) {
  return <AdminLayout>{page}</AdminLayout>;
};

export default Blog;
