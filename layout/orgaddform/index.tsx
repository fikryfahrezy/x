import type { ChangeEvent } from "react";
import type { AddPeriodIn, PositionIn } from "@/services/period";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yyyyMm } from "@/lib/fmt";
import { addPeriod } from "@/services/period";
import Input from "@/components/input";
import Button from "@/components/button";
import Drawer from "@/components/drawer";
import Toast, { useToast } from "@/components/toast";
import Label from "@/components/label";
import ToastComponent from "@/layout/toastcomponent";
import OrgStructForm from "@/layout/orgstructform";
import OrgGoalWrite from "@/layout/orggoalwrite";
import InputErrMsg from "@/layout/inputerrmsg";
import styles from "./Styles.module.css";

const defaultFunc = () => {};

type OrgAddFormProps = {
  isOpen: boolean;
  onSubmited: () => void;
  onCancel: () => void;
};

const OrgAddForm = ({
  isOpen = false,
  onSubmited = defaultFunc,
  onCancel = defaultFunc,
}: OrgAddFormProps) => {
  const [endDate, setEndDate] = useState(yyyyMm(new Date()));
  const [structFormOpen, setStructFormOpen] = useState(false);
  const [goalModalOpen, setGoalMoalOpen] = useState(false);
  const [positions, setPositions] = useState<PositionIn[] | null>(null);
  const [goal, setGoal] = useState<Record<string, string> | null>(null);

  const defaultValues = {
    start_date: "",
    end_date: "",
  };
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues });

  const { toast, props } = useToast();

  const onSubmit = (
    positions: PositionIn[] | null,
    goal: Record<string, string> | null
  ) =>
    handleSubmit((data) => {
      const newData: AddPeriodIn = {
        start_date: `${data.start_date}-01`,
        end_date: `${data.end_date}-01`,
        mission: "",
        vision: "",
        positions: [],
      };

      if (positions !== null) {
        newData.positions = positions;
      }

      if (goal !== null && goal.mission !== undefined) {
        newData.mission = goal.mission;
      }

      if (goal !== null && goal.vision !== undefined) {
        newData.vision = goal.vision;
      }

      addPeriod(newData)
        .then(() => {
          reset(defaultValues, { keepDefaultValues: true });
          onSubmited();
        })
        .catch((e) => {
          toast({
            status: "error",
            render: () => <ToastComponent title="Error" message={e.message} />,
          });
        });
    });

  const onClose = () => {
    setPositions(null);
    reset(defaultValues, { keepDefaultValues: true });
    onCancel();
  };

  const onStartDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.currentTarget.value);
  };

  const onStructFormClose = () => {
    setStructFormOpen(false);
  };

  const onStructFormOpen = () => {
    setStructFormOpen(true);
  };

  const onStructFormModified = (positions: PositionIn[]) => {
    setPositions(positions);
    setStructFormOpen(false);
  };

  const onGoalModalOpen = () => {
    setGoalMoalOpen(true);
  };

  const onGoalModalModified = (goal: Record<string, string>) => {
    setGoal(goal);
    setGoalMoalOpen(false);
  };

  useEffect(() => {
    if (isOpen === false) {
      setStructFormOpen(false);
      setPositions(null);
    }
  }, [isOpen]);

  return (
    <>
      <h2 className={styles.drawerTitle}>Buat Periode Organisasi</h2>
      <form className={styles.drawerBody} onSubmit={onSubmit(positions, goal)}>
        <div className={styles.drawerContent}>
          <div className={styles.inputGroup}>
            <Input
              {...register("start_date", {
                required: true,
              })}
              autoComplete="off"
              label="Awal Periode:"
              required={true}
              id="start_date"
              type="month"
              min={yyyyMm(new Date())}
              onChange={onStartDateChange}
              isInvalid={errors["start_date"] !== undefined}
            />
            {errors["start_date"] ? (
              <InputErrMsg>This field is required</InputErrMsg>
            ) : (
              <></>
            )}
          </div>
          <div className={styles.inputGroup}>
            <Input
              {...register("end_date", {
                required: true,
              })}
              autoComplete="off"
              label="Akhir Periode:"
              required={true}
              id="end_date"
              type="month"
              min={endDate}
              isInvalid={errors["end_date"]!== undefined}
            />
            {errors["end_date"] ? (
              <InputErrMsg>This field is required</InputErrMsg>
            ) : (
              <></>
            )}
          </div>
          <div className={styles.inputGroup}>
            <Label note="(Lewati jika ingin dibuat atau diubah nanti)">
              Struktur Organisasi
            </Label>
            {positions !== null && positions.length !== 0 ? (
              <Button
                className={styles.formBtn}
                type="button"
                onClick={() => onStructFormOpen()}
              >
                Lihat
              </Button>
            ) : (
              <Button
                className={styles.formBtn}
                type="button"
                onClick={() => onStructFormOpen()}
              >
                Buat
              </Button>
            )}
          </div>
          <div className={styles.inputGroup}>
            <Label note="(Lewati jika ingin dibuat atau diubah nanti)">
              Visi &amp; Misi
            </Label>
            {goal !== null && goal.vision !== "" && goal.mission !== "" ? (
              <Button
                className={styles.formBtn}
                type="button"
                onClick={() => onGoalModalOpen()}
              >
                Lihat
              </Button>
            ) : (
              <Button
                className={styles.formBtn}
                type="button"
                onClick={() => onGoalModalOpen()}
              >
                Buat
              </Button>
            )}
          </div>
        </div>
        <div>
          <Button className={styles.formBtn} colorScheme="green" type="submit">
            Buat
          </Button>
          <Button
            colorScheme="red"
            type="reset"
            className={styles.formBtn}
            onClick={() => onClose()}
          >
            Batal
          </Button>
        </div>
      </form>
      <Drawer
        isOpen={structFormOpen}
        onClose={() => onStructFormClose()}
        withBackdrop={false}
      >
        <OrgStructForm
          isPositionSaved={positions !== null && positions.length !== 0}
          onSave={(positions) => onStructFormModified(positions)}
        />
      </Drawer>
      <OrgGoalWrite
        isOpen={goalModalOpen}
        prevData={goal}
        onSave={(goal) => onGoalModalModified(goal)}
      />
      <Toast {...props} />
    </>
  );
};

export default OrgAddForm;