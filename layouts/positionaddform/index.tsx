import { useForm } from "react-hook-form";
import { useMutation } from "react-query";
import { usePositionLevelsQuery, addPosition } from "@/services/position";
import Button from "cmnjg-sb/dist/button";
import Input from "cmnjg-sb/dist/input";
import Select from "cmnjg-sb/dist/select";
import ErrMsg from "@/layouts/errmsg";
import styles from "./Styles.module.css";

export type PositionAddFormType = "add";

const defaultFunc = () => {};

type PositionAddFormProps = {
  onSubmited: () => void;
  onCancel: () => void;
  onError: (
    type: PositionAddFormType,
    title?: string,
    message?: string
  ) => void;
  onLoading: (
    type: PositionAddFormType,
    title?: string,
    message?: string
  ) => void;
};

const PositionAddForm = ({
  onSubmited = defaultFunc,
  onCancel = defaultFunc,
  onError = defaultFunc,
  onLoading = defaultFunc,
}: PositionAddFormProps) => {
  const defaultValues = {
    name: "",
    level: 0,
  };
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues });

  const positionLevelsQuery = usePositionLevelsQuery();

  const addPositionMutation = useMutation<
    unknown,
    unknown,
    Parameters<typeof addPosition>[0]
  >((data) => {
    return addPosition(data);
  });

  const onSubmit = handleSubmit((data) => {
    onLoading("add", "Loading menambahkan jabatan");

    addPositionMutation
      .mutateAsync(data)
      .then(() => {
        reset(defaultValues, { keepDefaultValues: true });
        onSubmited();
      })
      .catch((e) => {
        onError("add", "Error menambahkan jabatan", e.message);
      });
  });

  const onClose = () => {
    reset(defaultValues, { keepDefaultValues: true });
    onCancel();
  };

  return (
    <>
      <h2 className={styles.drawerTitle}>Buat Jabatan</h2>
      <form className={styles.drawerBody} onSubmit={onSubmit}>
        <div className={styles.drawerContent}>
          <div className={styles.inputGroup}>
            <Input
              {...register("name", {
                required: true,
              })}
              autoComplete="off"
              required={true}
              label="Posisi:"
              id="name"
              isInvalid={errors.name !== undefined}
              errMsg={errors.name ? "Tidak boleh kosong" : ""}
            />
          </div>
          <div className={styles.inputGroup}>
            {positionLevelsQuery.isLoading ? (
              "Loading..."
            ) : positionLevelsQuery.error ? (
              <ErrMsg />
            ) : (
              <Select
                {...register("level", {
                  required: true,
                  valueAsNumber: true,
                })}
                label="Level:"
                id="level"
                defaultValue=""
                required={true}
                isInvalid={errors.level !== undefined}
                errMsg={errors.level ? "Tidak boleh kosong" : ""}
              >
                <option disabled value="">
                  Pilih Level
                </option>
                {positionLevelsQuery.data?.data.map(({ level }) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </Select>
            )}
          </div>
        </div>
        <div>
          <Button
            colorScheme="green"
            type="submit"
            className={styles.formBtn}
            data-testid="save-btn"
          >
            Buat
          </Button>
          <Button
            colorScheme="red"
            type="reset"
            className={styles.formBtn}
            onClick={() => onClose()}
            data-testid="cancel-btn"
          >
            Batal
          </Button>
        </div>
      </form>
    </>
  );
};

export default PositionAddForm;
