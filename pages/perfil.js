import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, StatusBar, Image, Alert, Platform, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from "react-native-safe-area-context";
import * as Animatable from 'react-native-animatable';

export default function Perfil() {
    const [user, setUser] = useState({ email: '', usuario: '', nome: '', telefone: '', photo: null });
    const navigation = useNavigation();
    const route = useRoute();
    const isGuest = route.params?.isGuest || false;

    // Fonte
    const [fontsLoaded, fontError] = useFonts({
        'Raleway': require('../assets/fonts/Raleway-Regular.ttf'),
        'Raleway-Black': require('../assets/fonts/Raleway-Black.ttf'),
        'Raleway-Bold': require('../assets/fonts/Raleway-Bold.ttf'),
        'Raleway-ExtraBold': require('../assets/fonts/Raleway-ExtraBold.ttf'),
        'Raleway-Light': require('../assets/fonts/Raleway-Light.ttf'),
        'Raleway-Medium': require('../assets/fonts/Raleway-Medium.ttf'),
        'Raleway-SemiBold': require('../assets/fonts/Raleway-SemiBold.ttf'),
    });

    const onLayoutRootView = useCallback(async () => {
        if (fontsLoaded || fontError) {
            await SplashScreen.hideAsync();
        }
    }, [fontsLoaded, fontError]);

    if (!fontsLoaded && !fontError) {
        return null;
    }

    useEffect(() => {
        const getUser = async () => {
            const userData = await AsyncStorage.getItem('user');
            if (userData) {
                const { email, usuario, nome, telefone } = JSON.parse(userData);
                const userPhotoData = await AsyncStorage.getItem(email);
                const userPhoto = userPhotoData ? JSON.parse(userPhotoData).photo : null;
                setUser({ email, usuario, nome, telefone, photo: userPhoto });
            }
        };
        getUser();
    }, []);

    useEffect(() => {
        const resetPhotoForGuest = () => {
            if (isGuest) {
                setUser(prevUser => ({ ...prevUser, photo: null }));
            }
        };

        resetPhotoForGuest();
    }, [isGuest]);

    const openLink = () => {
        Linking.openURL('https://www.tendaatacado.com.br/institucional/nossas-ofertas');
    };

    const pickImage = async () => {
        if (Platform.OS === 'web') {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = async (event) => {
                const file = event.target.files[0];
                if (file) {
                    const uri = URL.createObjectURL(file);
                    const newUser = { ...user, photo: uri };
                    setUser(newUser);
                    await AsyncStorage.setItem(user.email, JSON.stringify(newUser));
                }
            };
            input.click();
        } else {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permissão necessária', 'Precisamos de permissão para acessar suas fotos.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });

            if (!result.canceled) {
                const newUser = { ...user, photo: result.assets[0].uri };
                setUser(newUser);
                await AsyncStorage.setItem(user.email, JSON.stringify(newUser));
            }
        }
    };

    const logout = async () => {
        await AsyncStorage.removeItem('user');
        setUser({ email: '', usuario: '', nome: '', telefone: '', photo: null });
        navigation.navigate('inicio');
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ScrollView style={styles.scrollView}>
                <Animatable.View delay={600} animation='fadeInUp' style={styles.tudo}>
                    <View style={styles.container} onLayout={onLayoutRootView}>
                        <Pressable onPress={pickImage}>
                            {user.photo ? (
                                <Image source={{ uri: user.photo }} style={styles.imageUser} />
                            ) : (
                                <View style={styles.imageUser}>
                                    <Ionicons name="camera-outline" size={40} color="#fff" />
                                </View>
                            )}
                        </Pressable>
                        {isGuest ? (
                            <Text style={styles.info1}>Você está logado como convidado.</Text>
                        ) : (
                            <>
                                <View style={styles.infoPega}>
                                    <Text style={styles.info1}>{user.nome}</Text>
                                    <Text style={styles.info2}>{user.email}</Text>
                                </View>
                            </>
                        )}
                        <Pressable style={styles.botao} onPress={logout}>
                            <Text style={styles.sair}>Sair</Text>
                        </Pressable>
                        <View style={styles.conteudo}>
                            <View style={styles.azul}>
                                <View style={styles.containerInfo}>
                                    <Text style={styles.text1}>Nome:</Text>
                                    {isGuest ? (
                                        <Text style={styles.info1}>Sem informação</Text>
                                    ) : (
                                        <Text style={styles.text2}>{user.nome}</Text>
                                    )}
                                </View>
                                <View style={styles.containerInfo}>
                                    <Text style={styles.text1}>Telefone:</Text>
                                    {isGuest ? (
                                        <Text style={styles.info1}>Sem informação</Text>
                                    ) : (
                                        <Text style={styles.text2}>{user.telefone}</Text>
                                    )}
                                </View>
                            </View>
                            <View style={styles.linha}></View>
                            <View style={styles.containerCont2}>
                                <Pressable style={styles.botao} onPress={() => navigation.navigate('index')}>
                                    <View style={styles.cont2}>
                                        <Ionicons name="list" size={25} style={styles.iconToggle2} />
                                        <Text style={styles.textCont2}>Criar lista</Text>
                                        <Ionicons name="chevron-forward-outline" size={25} style={styles.iconToggle3} />
                                    </View>
                                </Pressable>
                                <Pressable onPress={openLink} style={({ pressed }) => [
                                    { backgroundColor: pressed ? 'rgba(0, 0, 0, 0.1)' : 'transparent' },
                                    styles.linkContainer
                                ]}>
                                    <View style={styles.cont2}>
                                        <Ionicons name="bag-handle-outline" size={25} style={styles.iconToggle2} />
                                        <Text style={styles.textCont2}>Promoções</Text>
                                        <Ionicons name="chevron-forward-outline" size={25} style={styles.iconToggle3} />
                                    </View>
                                </Pressable>
                            </View>
                            <Pressable onPress={() => navigation.goBack()} style={styles.buttonVoltar}>
                                <Text style={styles.buttonText}>Voltar</Text>
                            </Pressable>
                        </View>
                    </View>
                </Animatable.View>

                <StatusBar backgroundColor="#305BCC" barStyle="light-content" />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#305BCC',
        padding: 16,
    },
    imageUser: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#F6282A',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 40,
    },
    sair: {
        backgroundColor: '#6F8DDB',
        width: 70,
        textAlign: 'center',
        height: 30,
        paddingTop: 5,
        borderRadius: 20,
        fontFamily: 'Raleway-Bold',
        marginTop: 10
    },
    iconToggle3: {
        color: '#000',
        marginLeft: 'auto', // Empurra para a direita
        paddingRight: 10
    },
    containerInfo: {
        width: 150,
        padding: 20,
        backgroundColor: '#305BCC',
        borderRadius: 30,
        minHeight: 100,
        marginTop: 20,
        justifyContent: 'center',
        marginLeft: 10
    },
    text2: {
        fontSize: 30,
        fontFamily: 'Raleway-Bold',
        color: 'white'
    },
    azul: {
        flexDirection: 'row',
        marginRight: 'auto',
        marginLeft: 'auto'
    },
    iconToggle: {
        color: 'white'
    },
    iconToggle2: {
        color: '#305BCC',
        paddingLeft: 10
    },
    linha: {
        width: 1,
        height: 30,
        backgroundColor: '#fff'
    },
    text1: {
        width: 90,
        fontSize: 12,
        color: 'white'
    },
    containerCont2: {
        marginRight: 'auto',
        marginLeft: 'auto',
        marginTop: 20
    },
    cont2: {
        width: 310,
        height: 45,
        borderRadius: 14,
        backgroundColor: '#9DB5F3',
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10
    },
    textCont2: {
        paddingLeft: 10,
        flex: 1 // Ocupa o espaço disponível
    },
    infoPega: {
        paddingTop: 10,
        textAlign: 'center',
        alignItems: 'center',
    },
    info1: {
        fontSize: 18,
        fontFamily: 'Raleway',
        color: '#fff',
        fontWeight: '700'
    },
    info2: {
        fontSize: 15,
        marginBottom: 8,
        fontFamily: 'Raleway',
        color: '#D5D5D5',
    },
    conteudo: {
        paddingTop: 10,
        marginTop: 20,
        backgroundColor: '#fff',
        borderTopRightRadius: 50,
        borderTopLeftRadius: 50,
        height: 600,
        width: '102%',
    },
    buttonVoltar: {
        backgroundColor: '#F6282A',
        padding: 10,
        alignItems: 'center',
        borderRadius: 25,
        width: 160,
        marginTop: 60,
        height: 50,
        marginRight: 'auto',
        marginLeft: 'auto'
    },
    buttonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 20,
        fontFamily: 'Raleway',
    },
});
