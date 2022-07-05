import type { DuesOut } from "@/services/dues";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "react-query";
import Input from "cmnjg-sb/dist/input";
import Button from "cmnjg-sb/dist/button";
import Toast from "cmnjg-sb/dist/toast";
import useToast from "cmnjg-sb/dist/toast/useToast";
import { yyyyMm } from "@/lib/fmt";
import { editDues, removeDues, useCheckPaidDuesQuery } from "@/services/dues";
import Modal from "@/layouts/modal";
import ToastComponent from "@/layouts/toastcomponent";
import InputErrMsg from "@/layouts/inputerrmsg";
import ErrMsg from "@/layouts/errmsg";
import styles from "./Styles.module.css";

const defaultFunc = () => {};

type DuesEditFormProps = {
  prevData: DuesOut;
  onEdited: () => void;
  onCancel: () => void;
};

const DuesEditForm = ({
  prevData,
  onEdited = defaultFunc,
  onCancel = defaultFunc,
}: DuesEditFormProps) => {
  const [isEditable, setEditable] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);

  const paidDuesQuery = useCheckPaidDuesQuery(prevData ? prevData.id : 0, {
    enabled: !!prevData,
  });

  const defaultValues = {
    date: "",
    idr_amount: "",
  };
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues });
  const { toast, updateToast, props } = useToast();

  const removeDuesMutation = useMutation<
    unknown,
    unknown,
    Parameters<typeof removeDues>[0]
  >((id) => {
    return removeDues(id);
  });

  const editDuesMutation = useMutation<
    unknown,
    unknown,
    {
      id: Parameters<typeof editDues>[0];
      data: Parameters<typeof editDues>[1];
    }
  >(({ id, data }) => {
    return editDues(id, data);
  });

  const onReset = () => {
    reset(defaultValues, { keepDefaultValues: true });
    onEdited();
  };

  const onDelete = (id: number) => {
    const lastId = toast({
      status: "info",
      duration: 999999,
      render: () => <ToastComponent title="Loading menghapus tagihan" />,
    });

    removeDuesMutation
      .mutateAsync(id)
      .then(() => {
        onReset();
      })
      .catch((e) => {
        updateToast(lastId, {
          status: "error",
          render: () => (
            <ToastComponent
              title="Error menghapus tagihan"
              message={e.message}
              data-testid="toast-modal"
            />
          ),
        });
      });
  };

  const onSubmit = (id: number) =>
    handleSubmit((data) => {
      const newData = {
        ...data,
        date: `${data.date}-01`,
      };

      const lastId = toast({
        status: "info",
        duration: 999999,
        render: () => <ToastComponent title="Loading mengubah tagihan" />,
      });

      editDuesMutation
        .mutateAsync({ id, data: newData })
        .then(() => {
          onReset();
        })
        .catch((e) => {
          updateToast(lastId, {
            status: "error",
            render: () => (
              <ToastComponent
                title="Error mengubah tagihan"
                message={e.message}
                data-testid="toast-modal"
              />
            ),
          });
        });
    });

  const onSetEditable = () => {
    setEditable(true);
  };

  const onConfirmDelete = () => {
    setModalOpen(true);
  };

  const onCancelDelete = () => {
    setModalOpen(false);
  };

  const onClose = () => {
    reset(defaultValues, { keepDefaultValues: true });
    onCancel();
  };

  useEffect(() => {
    if (prevData !== null) {
      const { id, ...restData } = prevData;
      const newDate = restData.date.split("-").splice(0, 2).join("-");

      reset(
        {
          ...restData,
          date: newDate,
        },
        { keepDefaultValues: true }
      );
    }
  }, [prevData, reset]);

  return (
    <>
      {isEditable ? (
        <h2 className={styles.drawerTitle}>Ubah Tagihan Iuran</h2>
      ) : (
        <h2 className={styles.drawerTitle}>Detail Tagihan Iuran</h2>
      )}
      <form className={styles.drawerBody} onSubmit={onSubmit(prevData.id)}>
        <div className={styles.drawerContent}>
          <div className={styles.inputGroup}>
            <Input
              {...register("date", {
                required: true,
              })}
              autoComplete="off"
              type="month"
              min={yyyyMm(new Date(prevData.date))}
              label="Tanggal:"
              id="date"
              required={true}
              readOnly={!isEditable}
              isInvalid={errors.date !== undefined}
            />
            {errors.date ? (
              <InputErrMsg>Tidak boleh kosong</InputErrMsg>
            ) : (
              <></>
            )}
          </div>
          <div className={styles.inputGroup}>
            <Input
              {...register("idr_amount", {
                required: true,
              })}
              autoComplete="off"
              label="Jumlah:"
              type="number"
              id="idr_amount"
              required={true}
              readOnly={!isEditable}
              isInvalid={errors["idr_amount"] !== undefined}
            />
            {errors["idr_amount"] ? (
              <InputErrMsg>Tidak boleh kosong</InputErrMsg>
            ) : (
              <></>
            )}
          </div>
        </div>
        <div>
          {!isEditable ? (
            <>
              {paidDuesQuery.isLoading || paidDuesQuery.isIdle ? (
                "Loading..."
              ) : paidDuesQuery.error ? (
                <ErrMsg />
              ) : paidDuesQuery.data.data["is_paid"] ? (
                <p>
                  <em data-testid="paid-dues-msg">
                    Seseorang telah membayar iurang bulanan, tidak dapat diubah
                    atau hapus
                  </em>
                </p>
              ) : (
                <>
                  <Button
                    key="edit_btn"
                    colorScheme="green"
                    type="button"
                    className={styles.formBtn}
                    onClick={() => onSetEditable()}
                    data-testid="editable-dues-btn"
                  >
                    Ubah
                  </Button>
                  <Button
                    colorScheme="red"
                    type="button"
                    className={styles.formBtn}
                    onClick={() => onConfirmDelete()}
                    data-testid="remove-dues-btn"
                  >
                    Hapus
                  </Button>
                </>
              )}
            </>
          ) : (
            <>
              <Button
                key="save_edit_btn"
                colorScheme="green"
                type="submit"
                className={styles.formBtn}
                data-testid="edit-dues-btn"
              >
                Ubah
              </Button>
              <Button
                colorScheme="red"
                type="reset"
                className={styles.formBtn}
                onClick={() => onClose()}
              >
                Batal
              </Button>
            </>
          )}
        </div>
      </form>
      <Modal
        isOpen={isModalOpen}
        heading="Peringatan!"
        onCancel={() => onCancelDelete()}
        onConfirm={() => onDelete(prevData.id)}
      >
        <p>Apakah anda yakin ingin menghapus data yang dipilih?</p>
      </Modal>
      <Toast {...props} />
    </>
  );
};

export default DuesEditForm;
