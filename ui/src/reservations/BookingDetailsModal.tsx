import { useState } from "react";
import { useShowInfoToast } from "../utils/toasts";
import { fromDateStringToIso } from "../utils/datetime";
import {
  DateRangeInput,
  FocusedInput,
  OnDatesChangeProps,
} from "@datepicker-react/styled";
import { Box, Button, Dialog, Separator, TextField } from "@radix-ui/themes";
import { NewReservation } from "./api";
import { useEmailValidation } from "../hooks/useEmailValidation";
import styled from "styled-components";

interface BookingDetailsModalProps {
  roomNumber: string;
  onSubmit: (booking: NewReservation) => void;
}

interface BookingFormProps {
  roomNumber: string;
  onSubmit: (booking: NewReservation) => void;
}


export function BookingDetailsModal({
  roomNumber,
  onSubmit,
}: BookingDetailsModalProps) {
  return (
    <Dialog.Content size="4">
      <Dialog.Title>Booking Room #{roomNumber}</Dialog.Title>
      <Dialog.Description>
        Provide details for your reservation
      </Dialog.Description>
      <Separator color="cyan" size="4" my="4" />
      <BookingForm roomNumber={roomNumber} onSubmit={onSubmit} />
    </Dialog.Content>
  );
}

const DimSlot = styled(TextField.Slot)`
  background-color: var(--gray-4);
  margin-right: 8px;
`;

const BottomRightBox = styled(Box)`
  position: absolute;
  bottom: 0;
  right: 0;
`;

const DateRangeContainer = styled.div<{ isValid: boolean }>`
  border: 2px solid ${({ isValid }) => (isValid ? "var(--green-9)" : "var(--red-9)")};
  border-radius: 4px;
  padding: 8px;
  margin-top: 16px;

  &:focus-within {
    box-shadow: 0 0 0 2px ${({ isValid }) => (isValid ? "var(--green-6)" : "var(--red-6)")};
  }
`;

const EmailContainer = styled.div<{ isValid: boolean }>`
  border: 2px solid ${({ isValid }) => (isValid ? "var(--green-9)" : "var(--red-9)")};
  border-radius: 4px;
  padding: 8px;
  margin-bottom: 16px;

  &:focus-within {
    box-shadow: 0 0 0 2px ${({ isValid }) => (isValid ? "var(--green-6)" : "var(--red-6)")};
  }
`;

const ErrorMessage = styled.div`
  color: var(--red-9);
  margin-top: 8px;
  font-size: 0.9rem;
`;

function BookingForm({ roomNumber, onSubmit }: BookingFormProps) {
  const { email, error: emailError, handleEmailChange } = useEmailValidation("");
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);



  const [focusedInput, setFocusedInput] = useState<FocusedInput | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);
  const showProcessingToast = useShowInfoToast("Processing booking...");
  const showNoInfoToast = useShowInfoToast("Missing email or dates.");

  const isEmailValid = email && !emailError ? true : false;
  const areDatesValid = dateRange[0] && dateRange[1] && !dateError ? true : false;

  function handleSubmit(evt: React.MouseEvent<HTMLButtonElement>) {
    if (!email || !dateRange[0] || !dateRange[1]) {
      showNoInfoToast();
      evt.preventDefault();
      return false;
    }

    showProcessingToast();
    onSubmit({
      RoomNumber: roomNumber,
      GuestEmail: email,
      Start: fromDateStringToIso(dateRange[0]),
      End: fromDateStringToIso(dateRange[1]),
    });
    return true;
  }

  function handleDateChange(data: OnDatesChangeProps) {
    const { startDate, endDate } = data;

    setDateRange([startDate || null, endDate || null]);

    if (startDate && endDate) {
      const differenceInTime = endDate.getTime() - startDate.getTime();
      const differenceInDays = differenceInTime / (1000 * 3600 * 24);

      if (startDate >= endDate) {
        setDateError("End date must be at least one day after start date.");
      } else if (differenceInDays > 30) {
        setDateError("Booking cannot be longer than 30 days.");
      } else {
        setDateError(null);
      }
    } else {
      setDateError(null);
    }

    if (!startDate) {
      setFocusedInput("startDate");
    } else if (!endDate) {
      setFocusedInput("endDate");
    } else {
      setFocusedInput(null);
    }



  }

  return (
    <Box style={{ position: "relative", minHeight: 700 }}>
      <EmailContainer isValid={isEmailValid}>
        <TextField.Root
          placeholder="... address@domain.tld ..."
          onChange={handleEmailChange}
          value={email}
          type="email"
          size="3"
          mb="4"
        >
          <DimSlot side="left" prefix="email">
            Email
          </DimSlot>
        </TextField.Root>
      </EmailContainer>
      {emailError && <ErrorMessage>{emailError}</ErrorMessage>}

      <DateRangeContainer isValid={areDatesValid}>
        <DateRangeInput
          vertical
          showSelectedDates={false}
          placement="bottom"
          showStartDateCalendarIcon={false}
          showEndDateCalendarIcon={false}
          displayFormat="dd/MM/yyyy"
          onDatesChange={handleDateChange}
          startDate={dateRange[0]}
          endDate={dateRange[1]}
          focusedInput={focusedInput}
          onFocusChange={setFocusedInput}
          showResetDates={false}
        />
      </DateRangeContainer>

      {dateError && <ErrorMessage>{dateError}</ErrorMessage>}

      <BottomRightBox>
        <Dialog.Close>
          <Button
            size="3"
            color="mint"
            mt="4"
            onClick={handleSubmit}
            disabled={!email || !areDatesValid || !isEmailValid}
          >
            Reserve
          </Button>
        </Dialog.Close>
      </BottomRightBox>
    </Box>
  );
}
