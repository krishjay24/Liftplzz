import React, { useState } from "react";
import { StyleSheet, View, Alert } from "react-native";
import { TextInput, Button, Card } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { BASE_URL } from "../utils/apiConfig";

const Login = ({ navigation }) => {
  const [userName, setUserName] = useState(""); // State for username
  const [password, setPassword] = useState(""); // State for password

  const handleLogin = async () => {
    if (!userName || !password) {
      Alert.alert("Error", "Please enter both username and password.");
      return;
    }
  
    const loginData = { username: userName, password: password };
  
    try {
      const response = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });
  
      const textResponse = await response.text(); // Read as text first
      console.log("Raw response:", textResponse);
  
      try {
        const result = JSON.parse(textResponse); // Parse manually
        if (response.ok) {
          Alert.alert("Success", result.message);
          // navigation.navigate("NavigatingScreens");
          navigation.navigate("GoogleMapScreen");
        } else {
          Alert.alert("Error", result.message || "Login failed.");
        }
      } catch (jsonError) {
        Alert.alert("Error", "Invalid response from server.");
      }
    } catch (error) {
      console.error("Error during login:", error);
      Alert.alert("Error", "Unable to connect to server.");
    }
  };
  

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="Login" titleStyle={styles.title} />
        <Icon name="motorbike" color="#6200ee" size={35} style={styles.bike} />
        <Card.Content>
          <TextInput
            label="User Name"
            mode="flat"
            underlineColor="#6200ee"
            style={styles.input}
            value={userName}
            placeholder="Enter your Name"
            onChangeText={setUserName}
            left={<TextInput.Icon icon="account" />}
          />
          <TextInput
            label="Password"
            mode="flat"
            style={styles.input}
            secureTextEntry
            underlineColor="#6200ee"
            value={password}
            placeholder="Enter your Password"
            onChangeText={setPassword}
            left={<TextInput.Icon icon="lock" />}
          />
          <Button
            mode="contained"
            style={styles.loginButton}
            buttonColor="#6200ee"
            // onPress={() => navigation.navigate("NavigatingScreens")}
            onPress={handleLogin}
          >
            Login
          </Button>
          <Button
            mode="text"
            onPress={() => navigation.navigate("SignUp")}
            style={styles.signupButton}
          >
            Don't have an account? Sign Up
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: "90%",
    elevation: 5,
    borderRadius: 8,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    position: "relative",
  },
  input: {
    marginBottom: 10,
  },
  loginButton: {
    marginVertical: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  bike: {
    position: "absolute",
    left: 105,
    top: 0,
  },
});
