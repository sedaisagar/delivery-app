import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { images } from "../constants";
import { useAuth } from "../contexts/AuthContext";

interface LoginErrors {
    email?: string;
    password?: string;
    general?: string;
}

export default function LoginScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<LoginErrors>({});
    const router = useRouter();
    const { login, isAuthenticated } = useAuth();

    // Redirect to main app if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            router.replace("/(tabs)");
        }
    }, [isAuthenticated, router]);

    const clearErrors = () => {
        setErrors({});
    };

    const validateForm = (): boolean => {
        const newErrors: LoginErrors = {};

        if (!email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = "Please enter a valid email";
        }

        if (!password) {
            newErrors.password = "Password is required";
        } else if (password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async () => {
        clearErrors();

        if (!validateForm()) {
            return;
        }

        try {
            setIsLoading(true);
            
            await login(email, password);
            router.replace("/(tabs)");
        } catch (error: any) {
            console.log("Login error:", error);
            console.log("Error message:", error.message);
            
            // Handle specific API errors with generic messages
            if (error.message && error.message.includes("400")) {
                try {
                    const errorData = JSON.parse(error.message);
                    console.log("Parsed error data:", errorData);
                    console.log("Error data keys:", Object.keys(errorData));
                    const newErrors: LoginErrors = {};
                    
                    // Check for all possible field names - handle both array and string values
                    if (errorData.email && (Array.isArray(errorData.email) || errorData.email)) {
                        newErrors.email = "Please enter a valid email address";
                    }
                    if (errorData.password && (Array.isArray(errorData.password) || errorData.password)) {
                        newErrors.password = "Please enter a valid password";
                    }
                    if (errorData.non_field_errors && (Array.isArray(errorData.non_field_errors) || errorData.non_field_errors)) {
                        newErrors.general = "Invalid email or password. Please try again.";
                    }
                    
                    // If no specific field errors found, show general error
                    if (Object.keys(newErrors).length === 0) {
                        newErrors.general = "Invalid email or password. Please try again.";
                    }
                    
                    console.log("Setting errors:", newErrors);
                    setErrors(newErrors);
                } catch (parseError) {
                    console.log("Error parsing error message:", parseError);
                    setErrors({ general: "Invalid email or password. Please try again." });
                }
            } else {
                setErrors({ general: "Login failed. Please check your credentials and try again." });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = () => {
        router.push("/register");
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.header}>
                    <Image source={images.logo} style={styles.logo} />
                    <Text style={styles.title}>Welcome Back</Text>
                    <Text style={styles.subtitle}>Sign in to your account</Text>
                </View>

                <View style={styles.form}>
                    {errors.general && (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>{errors.general}</Text>
                        </View>
                    )}

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={[styles.input, errors.email && styles.inputError]}
                            placeholder="Enter your email"
                            value={email}
                            onChangeText={(text) => {
                                setEmail(text);
                                if (errors.email) clearErrors();
                            }}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        {errors.email && <Text style={styles.fieldError}>{errors.email}</Text>}
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Password</Text>
                        <TextInput
                            style={[styles.input, errors.password && styles.inputError]}
                            placeholder="Enter your password"
                            value={password}
                            onChangeText={(text) => {
                                setPassword(text);
                                if (errors.password) clearErrors();
                            }}
                            secureTextEntry
                            autoCapitalize="none"
                        />
                        {errors.password && <Text style={styles.fieldError}>{errors.password}</Text>}
                    </View>

                    <TouchableOpacity
                        style={[styles.loginButton, isLoading && styles.disabledButton]}
                        onPress={handleLogin}
                        disabled={isLoading}
                    >
                        <Text style={styles.loginButtonText}>
                            {isLoading ? "Signing In..." : "Sign In"}
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>or</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    <TouchableOpacity
                        style={styles.registerButton}
                        onPress={handleRegister}
                    >
                        <Text style={styles.registerButtonText}>Create New Account</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Image source={images.loginGraphic} style={styles.footerImage} />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    scrollContainer: {
        flexGrow: 1,
        paddingHorizontal: 24,
    },
    header: {
        alignItems: "center",
        marginTop: 60,
        marginBottom: 40,
    },
    logo: {
        width: 80,
        height: 80,
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontFamily: "Quicksand-Bold",
        color: "#1a1a1a",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        fontFamily: "Quicksand-Regular",
        color: "#666",
        textAlign: "center",
    },
    form: {
        flex: 1,
        marginBottom: 20,
    },
    errorContainer: {
        backgroundColor: "#FEE2E2",
        borderWidth: 1,
        borderColor: "#FCA5A5",
        borderRadius: 8,
        padding: 12,
        marginBottom: 20,
    },
    errorText: {
        color: "#DC2626",
        fontSize: 14,
        fontFamily: "Quicksand-Regular",
        textAlign: "center",
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontFamily: "Quicksand-SemiBold",
        color: "#1a1a1a",
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: "#e1e1e1",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        fontFamily: "Quicksand-Regular",
        backgroundColor: "#f8f9fa",
    },
    inputError: {
        borderColor: "#DC2626",
        backgroundColor: "#FEF2F2",
    },
    fieldError: {
        color: "#DC2626",
        fontSize: 12,
        fontFamily: "Quicksand-Regular",
        marginTop: 4,
        marginLeft: 4,
    },
    loginButton: {
        backgroundColor: "#FF6B35",
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: "center",
        marginTop: 10,
        marginBottom: 20,
    },
    disabledButton: {
        opacity: 0.6,
    },
    loginButtonText: {
        color: "#fff",
        fontSize: 16,
        fontFamily: "Quicksand-SemiBold",
    },
    divider: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 20,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: "#e1e1e1",
    },
    dividerText: {
        marginHorizontal: 16,
        fontSize: 14,
        fontFamily: "Quicksand-Regular",
        color: "#666",
    },
    registerButton: {
        borderWidth: 1,
        borderColor: "#FF6B35",
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: "center",
    },
    registerButtonText: {
        color: "#FF6B35",
        fontSize: 16,
        fontFamily: "Quicksand-SemiBold",
    },
    footer: {
        alignItems: "center",
        marginBottom: 20,
    },
    footerImage: {
        width: 200,
        height: 150,
        resizeMode: "contain",
    },
}); 