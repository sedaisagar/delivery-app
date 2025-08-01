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

interface RegisterErrors {
    email?: string;
    username?: string;
    password?: string;
    password_confirm?: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    register_as?: string;
    general?: string;
}

export default function RegisterScreen() {
    const [formData, setFormData] = useState({
        email: "",
        username: "",
        password: "",
        password_confirm: "",
        first_name: "",
        last_name: "",
        phone: "",
        register_as: "customer" as "driver" | "customer",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<RegisterErrors>({});
    const router = useRouter();
    const { register, isAuthenticated } = useAuth();

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
        const newErrors: RegisterErrors = {};

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Please enter a valid email";
        }

        if (!formData.username.trim()) {
            newErrors.username = "Username is required";
        } else if (formData.username.length < 3) {
            newErrors.username = "Username must be at least 3 characters";
        }

        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        if (!formData.password_confirm) {
            newErrors.password_confirm = "Please confirm your password";
        } else if (formData.password !== formData.password_confirm) {
            newErrors.password_confirm = "Passwords do not match";
        }

        if (formData.phone && !/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
            newErrors.phone = "Please enter a valid phone number";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async () => {
        clearErrors();

        if (!validateForm()) {
            return;
        }

        try {
            setIsLoading(true);
            
            await register(formData);
            router.replace("/(tabs)");
        } catch (error: any) {
            console.log("Error message:", error.message);
            
            // Handle specific API errors with generic messages
            if (error.message && error.message.includes("400")) {
                try {
                    const errorData = JSON.parse(error.message);
                    console.log("Parsed error data:", errorData);
                    console.log("Error data keys:", Object.keys(errorData));
                    const newErrors: RegisterErrors = {};
                    
                    // Check for all possible field names - handle both array and string values
                    if (errorData.email && (Array.isArray(errorData.email) || errorData.email)) {
                        newErrors.email = "Please enter a valid email address";
                    }
                    if (errorData.username && (Array.isArray(errorData.username) || errorData.username)) {
                        newErrors.username = "Username is already taken. Please choose a different one.";
                    }
                    if (errorData.password && (Array.isArray(errorData.password) || errorData.password)) {
                        newErrors.password = "Password must be at least 6 characters long";
                    }
                    if (errorData.password_confirm && (Array.isArray(errorData.password_confirm) || errorData.password_confirm)) {
                        newErrors.password_confirm = "Passwords do not match";
                    }
                    if (errorData.first_name && (Array.isArray(errorData.first_name) || errorData.first_name)) {
                        newErrors.first_name = "Please enter your first name";
                    }
                    if (errorData.last_name && (Array.isArray(errorData.last_name) || errorData.last_name)) {
                        newErrors.last_name = "Please enter your last name";
                    }
                    if (errorData.phone && (Array.isArray(errorData.phone) || errorData.phone)) {
                        newErrors.phone = "Please enter a valid phone number";
                    }
                    if (errorData.register_as && (Array.isArray(errorData.register_as) || errorData.register_as)) {
                        newErrors.register_as = "Please select your role";
                    }
                    if (errorData.non_field_errors && (Array.isArray(errorData.non_field_errors) || errorData.non_field_errors)) {
                        newErrors.general = "Registration failed. Please check your information and try again.";
                    }
                    
                    // If no specific field errors found, show general error
                    if (Object.keys(newErrors).length === 0) {
                        newErrors.general = "Registration failed. Please check your information and try again.";
                    }
                    
                    console.log("Setting errors:", newErrors);
                    setErrors(newErrors);
                } catch (parseError) {
                    console.log("Error parsing error message:", parseError);
                    setErrors({ general: "Registration failed. Please check your information and try again." });
                }
            } else {
                setErrors({ general: "Registration failed. Please check your information and try again." });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        router.back();
    };

    const updateFormData = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear field-specific error when user starts typing
        if (errors[field as keyof RegisterErrors]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                        <Image source={images.arrowBack} style={styles.backIcon} />
                    </TouchableOpacity>
                    <Image source={images.logo} style={styles.logo} />
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Join our delivery community</Text>
                </View>

                <View style={styles.form}>
                    {errors.general && (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>{errors.general}</Text>
                        </View>
                    )}

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Email *</Text>
                        <TextInput
                            style={[styles.input, errors.email && styles.inputError]}
                            placeholder="Enter your email"
                            value={formData.email}
                            onChangeText={(text) => updateFormData("email", text)}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        {errors.email && <Text style={styles.fieldError}>{errors.email}</Text>}
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Username *</Text>
                        <TextInput
                            style={[styles.input, errors.username && styles.inputError]}
                            placeholder="Choose a username"
                            value={formData.username}
                            onChangeText={(text) => updateFormData("username", text)}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        {errors.username && <Text style={styles.fieldError}>{errors.username}</Text>}
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
                            <Text style={styles.label}>First Name</Text>
                            <TextInput
                                style={[styles.input, errors.first_name && styles.inputError]}
                                placeholder="First name"
                                value={formData.first_name}
                                onChangeText={(text) => updateFormData("first_name", text)}
                            />
                            {errors.first_name && <Text style={styles.fieldError}>{errors.first_name}</Text>}
                        </View>
                        <View style={[styles.inputContainer, { flex: 1, marginLeft: 10 }]}>
                            <Text style={styles.label}>Last Name</Text>
                            <TextInput
                                style={[styles.input, errors.last_name && styles.inputError]}
                                placeholder="Last name"
                                value={formData.last_name}
                                onChangeText={(text) => updateFormData("last_name", text)}
                            />
                            {errors.last_name && <Text style={styles.fieldError}>{errors.last_name}</Text>}
                        </View>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Phone</Text>
                        <TextInput
                            style={[styles.input, errors.phone && styles.inputError]}
                            placeholder="Phone number"
                            value={formData.phone}
                            onChangeText={(text) => updateFormData("phone", text)}
                            keyboardType="phone-pad"
                        />
                        {errors.phone && <Text style={styles.fieldError}>{errors.phone}</Text>}
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Password *</Text>
                        <TextInput
                            style={[styles.input, errors.password && styles.inputError]}
                            placeholder="Create a password"
                            value={formData.password}
                            onChangeText={(text) => updateFormData("password", text)}
                            secureTextEntry
                            autoCapitalize="none"
                        />
                        {errors.password && <Text style={styles.fieldError}>{errors.password}</Text>}
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Confirm Password *</Text>
                        <TextInput
                            style={[styles.input, errors.password_confirm && styles.inputError]}
                            placeholder="Confirm your password"
                            value={formData.password_confirm}
                            onChangeText={(text) => updateFormData("password_confirm", text)}
                            secureTextEntry
                            autoCapitalize="none"
                        />
                        {errors.password_confirm && <Text style={styles.fieldError}>{errors.password_confirm}</Text>}
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Register as *</Text>
                        <View style={styles.roleContainer}>
                            <TouchableOpacity
                                style={[
                                    styles.roleButton,
                                    formData.register_as === "customer" && styles.roleButtonActive,
                                ]}
                                onPress={() => updateFormData("register_as", "customer")}
                            >
                                <Text
                                    style={[
                                        styles.roleButtonText,
                                        formData.register_as === "customer" && styles.roleButtonTextActive,
                                    ]}
                                >
                                    Customer
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.roleButton,
                                    formData.register_as === "driver" && styles.roleButtonActive,
                                ]}
                                onPress={() => updateFormData("register_as", "driver")}
                            >
                                <Text
                                    style={[
                                        styles.roleButtonText,
                                        formData.register_as === "driver" && styles.roleButtonTextActive,
                                    ]}
                                >
                                    Driver
                                </Text>
                            </TouchableOpacity>
                        </View>
                        {errors.register_as && <Text style={styles.fieldError}>{errors.register_as}</Text>}
                    </View>

                    <TouchableOpacity
                        style={[styles.registerButton, isLoading && styles.disabledButton]}
                        onPress={handleRegister}
                        disabled={isLoading}
                    >
                        <Text style={styles.registerButtonText}>
                            {isLoading ? "Creating Account..." : "Create Account"}
                        </Text>
                    </TouchableOpacity>
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
        marginBottom: 30,
    },
    backButton: {
        position: "absolute",
        left: 0,
        top: 0,
        padding: 10,
    },
    backIcon: {
        width: 24,
        height: 24,
    },
    logo: {
        width: 60,
        height: 60,
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontFamily: "Quicksand-Bold",
        color: "#1a1a1a",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        fontFamily: "Quicksand-Regular",
        color: "#666",
        textAlign: "center",
    },
    form: {
        flex: 1,
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
    row: {
        flexDirection: "row",
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
    roleContainer: {
        flexDirection: "row",
        gap: 12,
    },
    roleButton: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#e1e1e1",
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: "center",
        backgroundColor: "#f8f9fa",
    },
    roleButtonActive: {
        borderColor: "#FF6B35",
        backgroundColor: "#FF6B35",
    },
    roleButtonText: {
        fontSize: 16,
        fontFamily: "Quicksand-SemiBold",
        color: "#666",
    },
    roleButtonTextActive: {
        color: "#fff",
    },
    registerButton: {
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
    registerButtonText: {
        color: "#fff",
        fontSize: 16,
        fontFamily: "Quicksand-SemiBold",
    },
}); 