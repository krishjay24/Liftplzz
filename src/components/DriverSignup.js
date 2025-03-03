import React, { useState } from "react";
import { StyleSheet, View, Text, Alert } from "react-native";
import { TextInput, Button, Card } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { BASE_URL } from "../utils/apiConfig";

const DriverSignup = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [model, setModel] = useState("");
  const [license, setLicense] = useState("");
  const [capacity, setCapacity] = useState("");

  const handleSignUp = async () => {
    if (
      !username ||
      !email ||
      !phone ||
      !password ||
      !model ||
      !license ||
      !capacity
    ) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    const data = {
      name: username, // Renamed key
      email,
      phone,
      password,
      vehicle_model: model, // Renamed key
      license_plate: license, // Renamed key
      capacity, // Added field
    };

    try {
      const response = await fetch(`${BASE_URL}/driver_signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json(); // Parse the response as JSON
      console.log("Response:", result);

      if (response.ok) {
        Alert.alert("Success", result.message);
        navigation.navigate("DriverLogin");
      } else {
        Alert.alert("Error", result.error);
      }
    } catch (error) {
      console.error("Error during signup:", error);
      Alert.alert("Error", "An error occurred. Please try again later.");
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="Create Account" titleStyle={styles.title} />
        <Icon
          name="account-plus"
          size={30}
          color="#6200ee"
          style={styles.icon}
        />
        <Card.Content>
          <TextInput
            label="Username"
            placeholder="Enter your Username"
            style={styles.input}
            underlineColor="#6200ee"
            left={<TextInput.Icon icon="account" />}
            value={username}
            onChangeText={setUsername}
          />
          <TextInput
            label="Email"
            placeholder="Enter your Email"
            style={styles.input}
            underlineColor="#6200ee"
            left={<TextInput.Icon icon="email" />}
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            label="Phone"
            placeholder="Enter your Phone"
            style={styles.input}
            underlineColor="#6200ee"
            left={<TextInput.Icon icon="phone" />}
            value={phone}
            onChangeText={setPhone}
          />
          <TextInput
            label="Password"
            placeholder="Create a Password"
            style={styles.input}
            secureTextEntry
            underlineColor="#6200ee"
            left={<TextInput.Icon icon="lock" />}
            value={password}
            onChangeText={setPassword}
          />
          <TextInput
            label="Vehicle Model"
            placeholder="Enter vehicle model"
            style={styles.input}
            underlineColor="#6200ee"
            left={<TextInput.Icon icon="clipboard-text" />}
            value={model}
            onChangeText={setModel}
          />
          <TextInput
            label="License Number"
            placeholder="Enter License number"
            style={styles.input}
            underlineColor="#6200ee"
            left={<TextInput.Icon icon="card-account-details" />}
            value={license}
            onChangeText={setLicense}
          />
          <TextInput
            label="Capacity"
            placeholder="Enter No of people"
            style={styles.input}
            underlineColor="#6200ee"
            left={<TextInput.Icon icon="card-account-details" />}
            value={capacity}
            onChangeText={setCapacity}
          />
          <Button
            mode="contained"
            style={styles.loginButton}
            buttonColor="#6200ee"
            onPress={handleSignUp}
          >
            Sign Up
          </Button>
          <Button
            mode="text"
            onPress={() => navigation.navigate("DriverLogin")}
            style={styles.signupButton}
          >
            Already have a Driver account? Login
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
};

export default DriverSignup;

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
  },
  input: {
    marginBottom: 10,
  },
  loginButton: {
    marginVertical: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  icon: {
    position: "absolute",
    left: 52,
    top: 3,
  },
});
