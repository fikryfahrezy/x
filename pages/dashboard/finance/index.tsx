import type { ReactElement } from "react";
import type { CashflowOut } from "@/services/cashflow";
import { useState, Fragment } from "react";
import {
  RiAddLine,
  RiMoneyDollarCircleLine,
  RiMore2Line,
} from "react-icons/ri";
import { debounce } from "@/lib/perf";
import Observe from "@/lib/use-observer";
import { idrCurrency } from "@/lib/fmt";
import { useCashflowsQuery } from "@/services/cashflow";
import { CASHFLOW_TYPE } from "@/services/cashflow";
import Button from "cmnjg-sb/dist/button";
import IconButton from "cmnjg-sb/dist/iconbutton";
import Drawer from "cmnjg-sb/dist/drawer";
import AdminLayout from "@/layouts/adminpage";
import CashflowAddForm from "@/layouts/cashflowaddform";
import CashflowEditForm from "@/layouts/cashfloweditform";
import EmptyMsg from "@/layouts/emptymsg";
import CashflowSummary from "@/layouts/cashflowsummary";
import ErrMsg from "@/layouts/errmsg";
import styles from "./Styles.module.css";

const inOutField = Object.freeze({
  income: "income_cash",
  outcome: "outcome_cash",
});

const Finance = () => {
  const [open, setOpen] = useState(false);

  const [cashflowStatus, setCashflowStatus] = useState<
    typeof CASHFLOW_TYPE[keyof typeof CASHFLOW_TYPE]
  >(CASHFLOW_TYPE.INCOME);
  const [tempData, setTempData] = useState<CashflowOut | null>(null);
  const cashflowsQuery = useCashflowsQuery();

  const observeCallback = () => {
    if (cashflowsQuery.hasNextPage) {
      cashflowsQuery.fetchNextPage();
    }
  };

  const onClose = () => {
    setTempData(null);
    setOpen(false);
  };

  const onOpen = () => {
    setOpen(true);
  };

  const onOptClick = (val: CashflowOut) => {
    setTempData(val);
    setOpen(true);
  };

  const onModiefied = () => {
    setTempData(null);
    setOpen(false);
    cashflowsQuery.refetch();
  };

  const activateIncomeTab = () => {
    setCashflowStatus(CASHFLOW_TYPE.INCOME);
  };

  const activateOutcomeTab = () => {
    setCashflowStatus(CASHFLOW_TYPE.OUTCOME);
  };

  return (
    <>
      <div className={styles.contentHeadSection}>
        <Button
          colorScheme="green"
          leftIcon={<RiAddLine />}
          onClick={() => onOpen()}
          className={styles.addBtn}
          data-testid="add-transaction-btn"
        >
          Buat Transaksi
        </Button>
        {cashflowsQuery.isLoading ? (
          "Loading..."
        ) : cashflowsQuery.error ? (
          <ErrMsg />
        ) : (
          <CashflowSummary
            income={idrCurrency.format(
              Number(cashflowsQuery.data?.pages[0].data["income_cash"])
            )}
            outcome={idrCurrency.format(
              Number(cashflowsQuery.data?.pages[0].data["outcome_cash"])
            )}
            total={idrCurrency.format(
              Number(cashflowsQuery.data?.pages[0].data["total_cash"])
            )}
          />
        )}
      </div>
      <div className={styles.contentBodySection}>
        <div className={styles.buttonTabs}>
          <button
            className={`${styles.buttonTab} ${
              cashflowStatus === CASHFLOW_TYPE.INCOME ? styles.tabActive : ""
            }`}
            onClick={() => activateIncomeTab()}
            data-testid="income-tab-btn"
          >
            Pemasukan
          </button>
          <button
            className={`${styles.buttonTab} ${
              cashflowStatus === CASHFLOW_TYPE.OUTCOME ? styles.tabActive : ""
            }`}
            onClick={() => activateOutcomeTab()}
            data-testid="outcome-tab-btn"
          >
            Pengeluaran
          </button>
        </div>
        <div className={styles.contentContainer}>
          {cashflowsQuery.isLoading ? (
            "Loading..."
          ) : cashflowsQuery.error ? (
            <ErrMsg />
          ) : cashflowsQuery.data?.pages[0].data.cashflows.length === 0 ||
            cashflowsQuery.data?.pages[0].data[inOutField[cashflowStatus]] ===
              "0" ? (
            <EmptyMsg />
          ) : (
            cashflowsQuery.data?.pages.map((page) => {
              return (
                <Fragment key={page.data.cursor}>
                  {page.data.cashflows
                    .filter(({ type }) => type === cashflowStatus)
                    .map((val) => {
                      const { id, date, idr_amount, note } = val;
                      return (
                        <div key={id} className={styles.listItem}>
                          <span className={styles.listIcon}>
                            <RiMoneyDollarCircleLine />
                          </span>
                          <div className={styles.listContent}>
                            <div className={styles.listBody}>
                              <span className={styles.listText}>{date}</span>
                              <p className={styles.listText}>{note}</p>
                            </div>
                            <span
                              className={`${styles.listCurrency} ${
                                cashflowStatus === CASHFLOW_TYPE.INCOME
                                  ? `${styles.green} test__income__color`
                                  : `${styles.red} test__outcome__color`
                              }`}
                              data-testid="cashflow-item"
                            >
                              {idrCurrency.format(Number(idr_amount))}
                            </span>
                          </div>
                          <IconButton
                            className={styles.moreBtn}
                            onClick={() => onOptClick(val)}
                            data-testid="cashflow-item-btn"
                          >
                            <RiMore2Line />
                          </IconButton>
                        </div>
                      );
                    })}
                </Fragment>
              );
            })
          )}
        </div>
      </div>
      <Observe callback={debounce(observeCallback, 500)} />
      <Drawer
        isOpen={open}
        onClose={() => onClose()}
        data-testid="cashflow-drawer"
      >
        {tempData === null ? (
          <CashflowAddForm
            onCancel={() => onClose()}
            onSubmited={() => onModiefied()}
          />
        ) : (
          <CashflowEditForm
            prevData={tempData}
            onCancel={() => onClose()}
            onEdited={() => onModiefied()}
          />
        )}
      </Drawer>
    </>
  );
};

Finance.getLayout = function getLayout(page: ReactElement) {
  return <AdminLayout className={styles.contentLayout}>{page}</AdminLayout>;
};

export default Finance;
