import { Text, StyleSheet, View, SafeAreaView, Pressable,TextInput,TouchableOpacity,Platform,Linking } from "react-native";
import * as Permissions from 'react-native-permissions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { requestForegroundPermissionsAsync,getCurrentPositionAsync } from "expo-location";
import { Camera } from'expo-camera'
import { Image } from 'expo-image';
import Webcam from 'react-webcam';

import jsQR from 'jsqr';
import { useEffect, useRef, useState } from "react";

import CardForPayModal from "../components/modals/CardForPayModal";
import PaymentModal from "../components/modals/PaymentModal";
import ErrorModal from "../components/modals/ErrorModal";
import Header from "../components/Header";
import Map from "../components/Map";


import { useUserLocation } from "../services/AsyncStorageContext";
import { asdsad } from "../coordinatesDummy";
import { getAddresses,getPlaceId ,getPaymentPage} from "../services/requests";


const HomeScreen =  () => {
    const {setUserLocation} = useUserLocation()
    // const [changeAddress,setChangeAddres] = useState(false)
    const [paymentModal, setPaymentModal] = useState(false);
    const [cardDataModal, setCardDataModal] = useState(false);
    const [errorModal, setErrorModal] = useState(false);
    const [coordinates,setCoordinates]= useState([])

    useEffect(() => {
     
      console.log('lol')
        asdsad()
          .then(result => {
            console.log(result)
            setCoordinates(result);
          })
          .catch(error => {
            console.error('Ошибка:', error);
          });
      }, []);

    //map
    const [markers, setMarkers] = useState([]);
    const mapRef = useRef(null);
    const [locationPermission,setLocationPermission] = useState(false)
    const [activeIndex, setActiveIndex] = useState(0);

    const onCarouselItemChange = (index) => {

        setActiveIndex(index);
        let location = coordinates[index];
       console.log()
        if (mapRef && mapRef.current) {
          //  
            mapRef.current.animateToRegion({
                latitude: parseFloat(location.latitude),
                longitude:parseFloat(location.longitude),
                latitudeDelta: 0.003,
                longitudeDelta: 0.002,
            });
        }

        markers[index].showCallout();
    }


    const askLocationPermission = async () => {
        const { granted } = await requestForegroundPermissionsAsync();

        if (!granted){ 
            setLocationPermission(false)
            console.log("Location permission not granted")
            return
        }
      
        let location = await getCurrentPositionAsync({});
        
        if(location.coords) {
            const {latitude,longitude} = location.coords
            const userCoordinates = {latitude,longitude}
       
            await AsyncStorage.setItem('userLocation', JSON.stringify({lat:latitude,lon:longitude}), (error) => {
                if (error) {
                  console.error('error', error);
                } else {
                  console.log('succes');
                }
              });
              setUserLocation(state=>!state)
        }
        

            setLocationPermission(true)
    } 
    

    useEffect(() => {
        askLocationPermission();
    }, [])
    // useEffect(() => {
    //   // Запрос разрешения на доступ к камере
    //   navigator.mediaDevices.getUserMedia({ video: true })
    //     .then(stream => {
    //       console.log('Разрешение на камеру получено');
      
    //     })
    //     .catch(error => {
         
    //       console.error('Ошибка при доступе к камере:', error);
    //     });
    // }, []);

    //camera
    const [cameraView, setCameraView] = useState(false);
    const [cameraPermission, setCameraPermission] = useState(null);
   
    const cameraPermisionFunction = async () => {
      
        const cameraPermission = await Camera.requestCameraPermissionsAsync();
     
        setCameraPermission(cameraPermission.granted);
       
    };

    useEffect(() => {
        
        cameraPermisionFunction();
    }, []);

    const onScanerPress = async () => {
      
        if (!cameraPermission) {
            
            const cameraPermission = await Camera.requestCameraPermissionsAsync();
            console.log(cameraPermission)
            alert(cameraPermission.granted)      
            return setCameraPermission(cameraPermission.granted);
        }
        setCameraView(!cameraView);
    }
//adressesList

const [addressSuggestion, setAddressSuggestion] = useState(null);
const [inputAddresValue,setInputAddressValue] = useState('')
const [onFocusInput, setOnFocusInput] = useState(false);
const [closeAddressesList, setCloseAddressesList] = useState(false);
    const handleGeoCode = async () => {
        try {
         const res = await getAddresses(inputAddresValue)
        if (res&&res.data.predictions&&res.data.predictions.length>0) {
         
         setAddressSuggestion(res.data.predictions);
        }
        } catch (error) {
         console.log(error)
        }
        
           
         };

         useEffect(() => {
           if (inputAddresValue===''){
            return setCloseAddressesList(true)
           }
           
            const geoTimeOut = setTimeout(()=>{
              setOnFocusInput(state=>true)
              if (onFocusInput) {
              
                setCloseAddressesList(false);
                handleGeoCode();
              }
            },500)
            
            return () => clearTimeout(geoTimeOut);
          }, [inputAddresValue]);

          const handleGetCoordinate =async (e) => {
            try {
              setOnFocusInput(false)
              const res = await getPlaceId(e.place_id)
          
              if(res&&res.status=='200') {
     
               
          
          const lat = res.data.result.geometry.location.lat
          const lon = res.data.result.geometry.location.lng
          
          await AsyncStorage.setItem('userLocation', JSON.stringify({lat,lon}), (error) => {
            if (error) {
              console.error('error', error);
            } else {
                console.log()
              console.log('succes');
            }
          });
          
          setInputAddressValue(res.data.result.formatted_address)
          setUserLocation(state=>!state)
   
            
              }
             
             
              setCloseAddressesList(true);
            } catch (error) {
              console.log(error)
            }
           
           
          };

         
      //qr scanner 
      const [scanned, setScanned] = useState(false);
      const [scannedData, setScannedData] = useState('');
      const webcamRef = useRef(null);
      const requestCameraPermission = async () => {
        try {
          // Вызов метода для получения разрешения на камеру
         const res = await navigator.mediaDevices.getUserMedia({ video: true })
    alert(res)
          console.log('Camera access granted');
          // Дальнейшая обработка
        } catch (error) {
          alert('dsadsd')
          console.error('Camera access denied:', error);
        }
      };
      useEffect(()=>{
        requestCameraPermission()
      },[])
      const openPaymentPage = async () => {
        try {
           const res =await getPaymentPage()


          if (res&&res.data&&res.data.response.checkout_url) {

            const paymentURL = res.data.response.checkout_url

          if(Platform.OS ==='web'){

            window.open(paymentURL, '_blank');
          } else {

            const supported = await Linking.canOpenURL(paymentURL);

          if (supported) {

           await Linking.openURL(paymentURL);
    } else {
      console.log("Can't open URL:", url);
    
  };
          }
        } }catch (error) {
          console.log(error)
        }
       
        

        
      
      }
      const handleBarCodeScanned = ({  data }) => {
       
        setScanned(true);
        setScannedData(data);
        if(data) {
          openPaymentPage();
          setCameraPermission(null)
        }
      };
    
      

      
       
const handleWebQrScan = () => {
  const video = webcamRef.current.video;
 
  const canvas = document.createElement('canvas');
  canvas.width = 343;
  canvas.height = 153;

  const context = canvas.getContext('2d');
  
  context.drawImage(video, 0, 0, 343, 153);

  const imageData = context.getImageData(0, 0, 343, 153);
  console.log(imageData.width)
  const code = jsQR(imageData.data, imageData.width, imageData.height);
  
  const qrTimeOut=setTimeout(handleWebQrScan, 100);
  if (code) {
    
   
    setScanned(true);
    setScannedData(code.data);
    clearTimeout(qrTimeOut)
    
    openPaymentPage()
    setCameraView(false)
  }
  
};
    return (
        <SafeAreaView style={styles.container}>
            <Header title="scan your code" />
            
          
            <PaymentModal
                address="Lvivska Str. Parking Forum Lviv"
                date="Jun 12, 2022"
                time="12:40-13:40"
                total="12"
                modalVisible={paymentModal}
                setModalVisible={setPaymentModal}
                showNextModal={setCardDataModal}
            />
            <CardForPayModal
                address="Lvivska Str. Parking Forum Lviv"
                date="Jun 12, 2022"
                time="12:40-13:40"
                total="12"
                modalVisible={cardDataModal}
                setModalVisible={setCardDataModal}
                setErrorModal={setErrorModal}
            />

            <ErrorModal modalVisible={errorModal} setModalVisible={setErrorModal} />

            <View style={styles.scaner}>
                
               {cameraView
                    ? 
                    Platform.OS==='web'?
                    
                    <View style={styles.cameraContainer}>
                    <Webcam 
                    ref={webcamRef}
                    videoConstraints={{
                      facingMode: "environment"
                    }}
                    onPlay={()=>handleWebQrScan()}
                    
                    />
                    </View>
                    : 
                
                  <View style={styles.cameraContainer}>
                    <Camera style={styles.cameraContainer} onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}type={Camera.Constants.Type.back} />
                    
                 </View>
                         
                            
                     
                     :
                     <Pressable style={styles.scaner} onPress={onScanerPress}>
                        <Image
                            style={styles.containerSize}
                            source={require('../../assets/images/scanQR.png')}
                        />
                        <View style={styles.dummy}>
                            <Text style={styles.dummyText}>tap to scan code</Text>
                        </View>
                    </Pressable>
                }
            </View>
<View style={locationPermission?styles.addressListHide:styles.addressBlock}>
            <View style={styles.inputContainer}>
                <TextInput style={styles.input} 
                value={inputAddresValue} 
                onChangeText={(e)=>setInputAddressValue(e)}
                 placeholder="enter your location"
                
                 />
               
              </View>  

              <View style={closeAddressesList?styles.addressListHide:styles.addressListContainer}>
      {addressSuggestion&&addressSuggestion.map((e, i) => (
        <TouchableOpacity
          key={i}
          style={styles.listItem}
          onPress={() => handleGetCoordinate(e)}
        >
          <Text>{e.description}</Text>
        </TouchableOpacity>
      ))}
    </View> 
    </View>   
            <Map
                markers={markers}
                activeIndex={activeIndex}
                onCarouselItemChange={onCarouselItemChange}
                mapRef={mapRef}
            />

        </SafeAreaView >
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    scaner: {
        alignSelf: "center",
        marginBottom: 16,
        width: 343,
        height: 153,
        borderRadius: 22
    },
    dummy: {
        position: "absolute",
        top: 0,
        left: 0,
        width: 343,
        height: 153,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(52,52,52, .6)",
        borderRadius: 33
    },
    dummyText: {
        color: "white",
        textTransform: "capitalize",
        fontSize: 18,
        fontWeight: "500"
    },
    cameraContainer: {
        width: 343,
        height: 153,
        borderRadius: 22,
        overflow: "hidden"
    },
    dataContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: 16,
      backgroundColor: 'white',
    },
    containerSize: {
        width: 343,
        height: 153
    },
    input: {
        width:300,
        borderWidth:1,
        borderColor: 'grey',
        height:30,
        borderRadius:15,
        paddingLeft:10
    },
    inputContainer:{
        alignItems:'center',
        display:'flex',
        marginBottom:20
    },
    listItem:{
        
        marginBottom:10,
        marginLeft:10,
        


    },
    
    addressListContainer:{
    
     
        position:'absolute',
        backgroundColor:'white',
        maxHeight:400,
        width:250,
        overflow:'scroll',
        top:40,
        backgroundColor:'#f0f0f0',
        borderRadius:15,


        
        
    },
    addressListHide:{
display:'none'
    },
    addressBlock:{
        alignItems:'center', 
        position:'relative',
        zIndex:6,
    }
})

export default HomeScreen