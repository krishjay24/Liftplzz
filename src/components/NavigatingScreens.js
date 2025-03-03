import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated } from "react-native";

const NavigatingScreens = ({ navigation }) => {

  return (
    <View style={styles.container}>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Login")}
      >
        <Text style={styles.buttonText}>User</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        // onPress={() => navigation.navigate("PickerIndex")}
        onPress={() => navigation.navigate("DriverLogin")}
      >
        <Text style={styles.buttonText}>Driver</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  button: {
    width: 120,
    height: 120,
    borderRadius: 60, // Makes the button round
    // backgroundColor: '#007BFF',
    backgroundColor: "#6200ee",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, // Adds shadow for Android
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default NavigatingScreens;
