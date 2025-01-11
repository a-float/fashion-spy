import { Box, TextInput, PasswordInput, Button } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useUser } from "ui/hooks/useUser";

const LoginForm = () => {
  const { loginMutation, signUpMutation } = useUser();

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      email: "",
      password: "",
    },

    validate: {
      // email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      // password: (value) =>
      //   value.length > 6 ? null : "Password must be at least 6 characters long",
    },
  });

  return (
    <Box style={{ maxWidth: 400, margin: "auto" }}>
      <TextInput
        label="Email"
        placeholder="Enter your email"
        type="email"
        required
        mb="md"
        {...form.getInputProps("email")}
      />
      <PasswordInput
        label="Password"
        placeholder="Enter your password"
        required
        mb="md"
        {...form.getInputProps("password")}
      />
      <Button
        fullWidth
        type="button"
        mb="sm"
        onClick={() =>
          form.onSubmit((values) => loginMutation.mutate(values))()
        }
      >
        Login
      </Button>
      <Button
        fullWidth
        variant="outline"
        type="button"
        onClick={() =>
          form.onSubmit((values) => signUpMutation.mutate(values))()
        }
      >
        Sign Up
      </Button>
    </Box>
  );
};

export default LoginForm;
