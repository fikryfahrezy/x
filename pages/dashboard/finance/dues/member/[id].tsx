import type { ReactElement } from "react";
import type { MemberDuesOut } from "@/services/member-dues";
import { useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { RiMoneyDollarCircleLine, RiMore2Line } from "react-icons/ri";
import { idrCurrency } from "@/lib/fmt";
import { useMemberDetailQuery } from "@/services/member";
import { useMemberDuesQuery, DUES_STATUS } from "@/services/member-dues";
import IconButton from "@/components/iconbutton";
import Drawer from "@/components/drawer";
import AdminLayout from "@/layout/adminpage";
import Badge from "@/components/badge";
import MemberDuesEditForm from "@/layout/memberdueseditform";
import EmptyMsg from "@/layout/emptymsg";
import ErrMsg from "@/layout/errmsg";
import styles from "./Styles.module.css";

const MemberDues = () => {
  const router = useRouter();
  const { id } = router.query;

  const [open, setOpen] = useState(false);
  const [tempData, setTempData] = useState<MemberDuesOut | null>(null);
  const memberDuesQuery = useMemberDuesQuery(id as string, {
    enabled: !!id,
  });
  const memberDetailQuery = useMemberDetailQuery(id as string, {
    enabled: !!id,
  });

  const onClose = () => {
    setTempData(null);
    setOpen(false);
  };

  const onOptClick = (val: MemberDuesOut) => {
    setTempData(val);
    setOpen(true);
  };

  /**
   * @return {void}
   */
  const onModiefied = () => {
    setTempData(null);
    setOpen(false);
    memberDuesQuery.refetch();
  };

  return (
    <>
      <div className={styles.contentHeadSection}>
        {memberDetailQuery.isLoading || memberDetailQuery.isIdle ? (
          "Loading..."
        ) : memberDetailQuery.error ? (
          <ErrMsg />
        ) : (
          <div className={styles.contentHeadPart}>
            <div className={styles.profileContainer}>
              <div className={styles.profileImgContainer}>
                <Image
                  src={
                    memberDetailQuery.data.data["profile_pic_url"]
                      ? memberDetailQuery.data.data["profile_pic_url"]
                      : "/images/image/person.png"
                  }
                  layout="responsive"
                  width={150}
                  height={150}
                  alt="Member profile pic"
                />
              </div>
              <h2 className={styles.profileName}>
                {memberDetailQuery.data.data.name}
              </h2>
            </div>
            <table className={styles.profileData}>
              <tbody>
                <tr>
                  <td>Nomor WA</td>
                  <td>:</td>
                  <td>{memberDetailQuery.data.data["wa_phone"]}</td>
                </tr>
                <tr>
                  <td>Nomor Lainnya</td>
                  <td>:</td>
                  <td>{memberDetailQuery.data.data["other_phone"]}</td>
                </tr>
                <tr>
                  <td>Jabatan</td>
                  <td>:</td>
                  <td>{memberDetailQuery.data.data.position}</td>
                </tr>
                <tr>
                  <td>Periode</td>
                  <td>:</td>
                  <td>
                    {memberDetailQuery.data.data.period.split("|").join(" - ")}
                  </td>
                </tr>
                <tr>
                  <td>Nama Homestay</td>
                  <td>:</td>
                  <td>{memberDetailQuery.data.data["homestay_name"]}</td>
                </tr>
                <tr>
                  <td>Alamat Homestay</td>
                  <td>:</td>
                  <td>{memberDetailQuery.data.data["homestay_address"]}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
        {memberDuesQuery.isLoading || memberDuesQuery.isIdle ? (
          "Loading..."
        ) : memberDuesQuery.error ? (
          <ErrMsg />
        ) : (
          <div className={styles.contentHeadPart}>
            <h2 className={styles.subHeadTitle}>Total Uang Iuran</h2>
            <p className={styles.overallCurrency}>
              {idrCurrency.format(
                Number(memberDuesQuery.data.data["total_dues"])
              )}
            </p>
            <div className={styles.currencyFlowContainer}>
              <div>
                <h3 className={styles.currencyFlowTitle}>Total Terbayar</h3>
                <p className={`${styles.currency} ${styles.green}`}>
                  {idrCurrency.format(
                    Number(memberDuesQuery.data.data["paid_dues"])
                  )}
                </p>
              </div>
              <div>
                <h3 className={styles.currencyFlowTitle}>
                  Total Belum Terbayar
                </h3>
                <p className={`${styles.currency} ${styles.red}`}>
                  {idrCurrency.format(
                    Number(memberDuesQuery.data.data["unpaid_dues"])
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className={styles.contentBodySection}>
        {memberDuesQuery.isLoading || memberDuesQuery.isIdle ? (
          "Loading..."
        ) : memberDuesQuery.error ? (
          <ErrMsg />
        ) : memberDuesQuery.data.data?.dues.length === 0 ? (
          <EmptyMsg />
        ) : (
          memberDuesQuery.data.data?.dues.map((val) => {
            const { date, id, idr_amount: idr, status } = val;
            const { badge, color } = (() => {
              switch (status) {
                case DUES_STATUS.PAID:
                  return {
                    badge: <Badge colorScheme="green">Sudah Lunas</Badge>,
                    color: styles.green,
                  };
                case DUES_STATUS.WAITING:
                  return {
                    badge: (
                      <Badge colorScheme="yellow">Menunggu Konfirmasi</Badge>
                    ),
                    color: styles.yellow,
                  };
                default:
                  return {
                    badge: <Badge colorScheme="red">Belum Lunas</Badge>,
                    color: styles.red,
                  };
              }
            })();

            return (
              <div key={id} className={styles.listItem}>
                <span className={styles.listIcon}>
                  <RiMoneyDollarCircleLine />
                </span>
                <div className={styles.listContent}>
                  <div className={styles.listBody}>
                    {badge}
                    <p className={styles.listText}>{date}</p>
                  </div>
                  <span className={`${styles.listCurrency} ${color}`}>
                    {idrCurrency.format(Number(idr))}
                  </span>
                </div>
                <IconButton
                  className={styles.moreBtn}
                  onClick={() => onOptClick(val)}
                >
                  <RiMore2Line />
                </IconButton>
              </div>
            );
          })
        )}
      </div>
      <Drawer isOpen={open} onClose={() => onClose()}>
        {tempData !== null ? (
          <MemberDuesEditForm
            prevData={tempData}
            onCancel={() => onClose()}
            onEdited={() => onModiefied()}
          />
        ) : (
          <></>
        )}
      </Drawer>
    </>
  );
};

MemberDues.getLayout = function getLayout(page: ReactElement) {
  return <AdminLayout className={styles.contentLayout}>{page}</AdminLayout>;
};

export default MemberDues;
