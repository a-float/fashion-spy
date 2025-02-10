import {
  Button,
  Paper,
  PasswordInput,
  SegmentedControl,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useUser } from "ui/hooks/useUser";

type FormValues = {
  username: string;
  password: string;
  action: "login" | "signUp";
};

const LoginForm = () => {
  const { loginMutation, signUpMutation } = useUser();

  const form = useForm<FormValues>({
    mode: "controlled",
    initialValues: {
      action: "login",
      username: "",
      password: "",
    },
    onValuesChange: () => {
      signUpMutation.reset();
      loginMutation.reset();
    },
    validate: {
      username: (value) => (value.length > 0 ? null : "Username required"),
      password: (value) => (value.length > 0 ? null : "Password required"),
    },
  });

  const handleSubmit = (values: FormValues) => {
    if (values.action === "login") loginMutation.mutate(values);
    else signUpMutation.mutate(values);
  };

  const error = loginMutation.error || signUpMutation.error;
  const statusMessage = signUpMutation.isSuccess
    ? "Account created successfully. Ask Mati to activate it in order to log in."
    : null;

  return (
    <Paper maw={400} mx="auto" my="xl" withBorder p="lg" radius="lg">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="lg">
          <SegmentedControl
            data={[
              { label: "Login", value: "login" },
              { label: "Sign Up", value: "signUp" },
            ]}
            {...form.getInputProps("action")}
          />
          <TextInput
            label="Username"
            placeholder="Enter your username"
            type="username"
            aria-required="true"
            {...form.getInputProps("username")}
            error={form.errors.username || error?.message}
          />
          <PasswordInput
            label="Password"
            placeholder="Enter your password"
            aria-required="true"
            {...form.getInputProps("password")}
            error={form.errors.password}
          />
          {form.values.action === "login" ? (
            <Button fullWidth type="submit" loading={loginMutation.isPending}>
              Login
            </Button>
          ) : (
            <Button
              variant="outline"
              fullWidth
              type="submit"
              loading={signUpMutation.isPending}
            >
              Sign Up
            </Button>
          )}
        </Stack>
        <Text mt="sm" c="green">
          {statusMessage}
        </Text>
      </form>
    </Paper>
  );
};

export default LoginForm;
