import type { ReactElement } from "react";
import type { DuesOut } from "@/services/dues";
import { useState, useEffect, Fragment } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { RiMoneyDollarCircleLine, RiMore2Line } from "react-icons/ri";
import { idrCurrency } from "@/lib/fmt";
import { debounce } from "@/lib/perf";
import Observe from "@/lib/use-observer";
import { useDuesQuery } from "@/services/dues";
import { useMembersDuesQuery } from "@/services/member-dues";
import { Drawer, Button, IconButton, Select, LinkButton } from "cmnjg-sb";
import AdminLayout from "@/layouts/adminpage";
import DuesAddForm from "@/layouts/duesaddform";
import DuesEditForm from "@/layouts/dueseditform";
import EmptyMsg from "@/layouts/emptymsg";
import MemberDuesItem from "@/layouts/memberduesitem";
import ErrMsg from "@/layouts/errmsg";
import styles from "./Styles.module.css";

const Dues = () => {
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [selectedDues, setSelectedDues] = useState<DuesOut | null>(null);
  const [tempData, setTempData] = useState<DuesOut | null>(null);
  const router = useRouter();

  const duesQuery = useDuesQuery();
  const membersDuesQuery = useMembersDuesQuery(
    selectedDues ? selectedDues.id : 0,
    {
      enabled: !!selectedDues,
    }
  );

  const observeCallback = () => {
    if (membersDuesQuery.hasNextPage) {
      membersDuesQuery.fetchNextPage();
    }
  };

  const onOpen = () => {
    setDrawerOpen(true);
  };

  const onDrawerClose = () => {
    setTempData(null);
    setDrawerOpen(false);
  };

  const openDrawer = (data: DuesOut | null) => {
    setTempData(data);
    setDrawerOpen(true);
  };

  const onModified = () => {
    setTempData(null);
    setDrawerOpen(false);
    membersDuesQuery.refetch();
    duesQuery.refetch();
  };

  const onDuesSelect = (val: string) => {
    const numVal = Number(val);

    const dues = duesQuery.data?.data.dues.find((v) => {
      return v.id === numVal;
    });

    if (dues !== undefined) {
      setSelectedDues(dues);
    }
  };

  useEffect(() => {
    const duesData = duesQuery.data;
    if (duesData !== undefined && duesData.data.dues.length != 0) {
      setSelectedDues(duesData.data.dues[0]);
    }
  }, [duesQuery.data]);

  return (
    <>
      <h1 className={styles.pageTitle}>Daftar Iuran Anggota</h1>
      <Button
        colorScheme="green"
        leftIcon={<RiMoneyDollarCircleLine />}
        onClick={() => onOpen()}
        className={styles.addBtn}
        data-testid="add-dues-btn"
      >
        Buat Tagihan
      </Button>
      <div className={styles.tableContainer}>
        <div className={styles.groupTitle}>
          <div className={styles.groupTitleBody}>
            <div>
              <p className={styles.groupSubtitle}>Tanggal</p>
              {duesQuery.isLoading ? (
                "Loading..."
              ) : duesQuery.error ? (
                <ErrMsg />
              ) : duesQuery.data ? (
                <Select
                  className={styles.select}
                  onChange={(e) => onDuesSelect(e.currentTarget.value)}
                  value={selectedDues ? selectedDues.id : ""}
                >
                  {duesQuery.data.data.dues.map((val) => {
                    const { id, date } = val;
                    return (
                      <option key={id} value={id}>
                        {date}
                      </option>
                    );
                  })}
                </Select>
              ) : (
                <></>
              )}
            </div>
            <div>
              <p className={styles.groupSubtitle}>Jumlah Iuran</p>
              {selectedDues !== null && selectedDues !== undefined ? (
                <p className={styles.groupSubvalue}>
                  {idrCurrency.format(Number(selectedDues["idr_amount"]))}
                </p>
              ) : (
                <></>
              )}
            </div>
          </div>
          <IconButton
            className={styles.moreBtn}
            onClick={() => openDrawer(selectedDues)}
            data-testid="option-dues-btn"
          >
            <RiMore2Line />
          </IconButton>
        </div>
        {membersDuesQuery.isLoading || membersDuesQuery.isIdle ? (
          <EmptyMsg />
        ) : membersDuesQuery.error ? (
          <ErrMsg />
        ) : membersDuesQuery.data?.pages[0].data["member_dues"].length === 0 ? (
          <EmptyMsg />
        ) : (
          membersDuesQuery.data?.pages.map((page) => {
            return (
              <Fragment key={page.data.cursor}>
                {page.data["member_dues"].map((val) => {
                  return (
                    <MemberDuesItem
                      key={val.id}
                      member={val}
                      moreBtn={
                        <Link
                          href={{
                            pathname: `${router.pathname}/member/[id]`,
                            query: { id: val["member_id"] },
                          }}
                          passHref
                        >
                          <LinkButton
                            colorScheme="green"
                            leftIcon={<RiMore2Line />}
                            className={styles.moreBtn}
                          />
                        </Link>
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
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => onDrawerClose()}
        data-testid="dues-drawer"
      >
        {tempData === null ? (
          <DuesAddForm
            onCancel={() => onDrawerClose()}
            onSubmited={() => onModified()}
          />
        ) : (
          <DuesEditForm
            prevData={tempData}
            onCancel={() => onDrawerClose()}
            onEdited={() => onModified()}
          />
        )}
      </Drawer>
    </>
  );
};

Dues.getLayout = function getLayout(page: ReactElement) {
  return <AdminLayout>{page}</AdminLayout>;
};

export default Dues;
