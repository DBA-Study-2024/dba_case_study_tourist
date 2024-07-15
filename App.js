import React, { useState, useEffect } from 'react';
import { View, PermissionsAndroid, Platform, Alert, Modal, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import Tts from 'react-native-tts';
import Api from './pages/Api';

const App = () => {
  const [region, setRegion] = useState(null);
  const [places, setPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [wikiSummary, setWikiSummary] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [speakerMode, setSpeakerMode] = useState(false);

  useEffect(() => {
    const requestLocationPermission = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Location permission denied');
          return;
        }
      }
      getCurrentLocation();
    };

    requestLocationPermission();
  }, []);

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
        fetchNearbyPlaces(latitude, longitude);
      },
      error => Alert.alert('Error', JSON.stringify(error)),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  };

  const fetchNearbyPlaces = async (latitude, longitude) => {
    try {
      const places = await Api.getNearbyPlaces(latitude, longitude);
      setPlaces(places);
    } catch (error) {
      Alert.alert('Error fetching places');
    }
  };

  const fetchWikiSummary = async (placeName) => {
    try {
      const summary = await Api.getWikiSummary(placeName);
      if(!summary)
        summary = "Need to gather more information"
      setWikiSummary(summary);
      setModalVisible(true);
    } catch (error) {
      Alert.alert("No Information available")
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {region && (
        <MapView style={{ flex: 1 }} region={region}   >
          { places.map((place, index) => (
            <Marker key={index}
              coordinate={{
                latitude: place.geometry.location.lat,
                longitude: place.geometry.location.lng,
              }}
              title={place.name}  description={place.vicinity} pinColor="blue"
              onPress={() => { setSelectedPlace(place);fetchWikiSummary(place.name); setModalVisible(true)}}
            />
          ))}
        </MapView>
      )}

      {selectedPlace && (
        <Modal
          animationType="slide"
          visible={modalVisible}
          onRequestClose={() => {setModalVisible(!modalVisible);Tts.stop();}}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>{selectedPlace.name}</Text>
              <Text style={styles.modalText}>{wikiSummary}</Text>
               <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={() => {setSpeakerMode(true); Tts.speak(wikiSummary)}}>
                          <Text> 📢 Read Aloud </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {setModalVisible(!modalVisible); setSpeakerMode(false); setWikiSummary(''); Tts.stop();}}>
                          <Text> 🛑 Close </Text>
                </TouchableOpacity>
                </View>
                {speakerMode && (
                <View style={styles.buttonContainer} visible={speakerMode} >
                    <TouchableOpacity onPress={() =>  Tts.speak(wikiSummary)}>
                          <Text> ▶️ Play </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() =>  {Tts.stop(); setSpeakerMode(false)}}>
                          <Text> ⏹️ Stop </Text>
                    </TouchableOpacity>
                </View>
                )}
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({

  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },

  buttonContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginTop: 10,
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  buttonControl: {
    backgroundColor: "#F194FF",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "justify",
  },
});

export default App;
