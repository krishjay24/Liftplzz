import React, { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    // Navigate to Login.js after 3 seconds
    const timer = setTimeout(() => {
      navigation.replace('NavigatingScreens');
    }, 3000);

    // Cleanup the timer on component unmount
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/splashScreen.png')} // Replace with your image path
        style={styles.image}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff', // Set your desired background color
  },
  image: {
    width: 350, // Adjust the size of your image
    height: 350,
  },
});

export default SplashScreen;
