import { Button, Container, Group, Text, Title } from "@mantine/core";
import { useRouter } from "ui/lib/routing";

const NotFound = () => {
  const { router } = useRouter();
  return (
    <Container ta="center" p="lg" my={"xl"}>
      <Title order={2}>404 Page Not Found</Title>
      <Text c="dimmed" size="md" mt="sm">
        The page you are looking for doesn&apos;t exist.
      </Text>
      <Group justify="center" mt="md">
        <Button
          variant="light"
          color="blue"
          onClick={() => router.navigate("/")}
        >
          Go Home
        </Button>
      </Group>
    </Container>
  );
};

export default NotFound;
