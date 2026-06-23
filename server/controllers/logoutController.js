export const logout = async (req, res) => {
    try {
        // For JWT-based auth, logout is mainly handled on the client side
        // by removing the token from localStorage
        return res.status(200).json({
            success: true,
            message: "Logout successful"
        });
    } catch (error) {
        console.error("Logout Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};