import React from 'react';
import { Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';

interface ButtonProps {
    disabled?: boolean;
    style?: TouchableOpacityProps['style'];
    activeOpacity?: TouchableOpacityProps['activeOpacity'];
    onPress?: TouchableOpacityProps['onPress'];
}

export const Button: React.FC<React.PropsWithChildren<ButtonProps>> = ({
    disabled,
    style,
    activeOpacity,
    onPress,
    children,
}) => {
    return (
        <TouchableOpacity 
            // style={[styles.button, disabled && {opacity: 0.7}, style]} 
            className='bg-blue-800 py-3 rounded-md flex flex-row items-center justify-center gap-2'
            onPress={onPress} 
            activeOpacity={activeOpacity ?? 0.7}
            disabled={disabled}
        >
            {/* <Text style={styles.btnText}>{children}</Text> */}
            <Text className='text-white font-bold'>{children}</Text>
        </TouchableOpacity>
    );
};

// const styles = StyleSheet.create({
//     button: {
//         backgroundColor: Colors.light.primary,
//         paddingVertical: 12,
//         borderRadius: 6,
//         display: 'flex',
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'center',
//         gap: 8,
//     },
//     btnText: {
//         color: Colors.light.primaryFg,
//         fontWeight: 'bold',
//     },
// });