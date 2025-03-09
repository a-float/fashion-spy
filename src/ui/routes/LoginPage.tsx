import {
  Box,
  Container,
  Divider,
  Flex,
  List,
  Paper,
  Text,
  Title,
} from "@mantine/core";
import LoginForm from "ui/components/LoginForm";
import Logo from "ui/components/Logo";

const LoginPage = () => {
  return (
    <Container my="xl" maw={{ base: 500, md: 900 }}>
      <Paper withBorder radius="lg" p="lg">
        <Flex
          justify="space-around"
          direction={{ base: "column", md: "row" }}
          gap="xl"
        >
          <Box flex={1}>
            <Title size="h2">
              Welcome to{" "}
              <Logo display={"inline"} style={{ fontSize: "inherit" }} />
            </Title>
            <Text mt="md">
              Track the prices of your favorite fashion items from multiple
              stores in one place!👗🕵️‍♂️
            </Text>
            <Box visibleFrom="md">
              <Title order={2} size="h3" my="md">
                Never miss a sale!
              </Title>
              <List pl="md">
                <List.Item>
                  Monitor price drops on clothing, shoes, and accessories
                </List.Item>
                <List.Item>Compare prices across different stores</List.Item>
              </List>
            </Box>
          </Box>
          <Divider hiddenFrom={"lg"} orientation="horizontal" />
          <Divider visibleFrom={"md"} orientation="vertical" />
          <Box flex={1}>
            <LoginForm />
          </Box>
        </Flex>
      </Paper>
    </Container>
  );
};

export default LoginPage;
