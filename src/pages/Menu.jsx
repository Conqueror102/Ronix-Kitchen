import React from 'react';
import { useGetAllProductsQuery } from '../features/RTKQUERY';
import { Link } from 'react-router-dom';

const Menu = () => {
    const { data: products, isLoading, error } = useGetAllProductsQuery();

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-red-500">Error loading products. Please try again later.</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-center mb-8">Our Menu</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products?.map((product) => (
                    <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                        <img 
                            src={product.image} 
                            alt={product.productName}
                            className="w-full h-48 object-cover"
                        />
                        <div className="p-4">
                            <h2 className="text-xl font-semibold mb-2">{product.productName}</h2>
                            <p className="text-gray-600 mb-2">{product.description}</p>
                            <div className="flex justify-between items-center">
                                <span className="text-lg font-bold text-blue-600">${product.price}</span>
                                <span className="text-sm text-gray-500">{product.category}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Menu; 