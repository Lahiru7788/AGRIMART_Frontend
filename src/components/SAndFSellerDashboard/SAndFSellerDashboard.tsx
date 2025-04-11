import Link from "next/link";
import { Home, PlusCircle, Package2, Eye, Users, LineChart, FileText } from "lucide-react";
import AGRIMART from "../../../public/Images/HeaderNav/AGRIMART.png";
import Image from "next/image";

const Sidebar = () => {
    return (
        <aside className="w-[260px] bg-white rounded-xl shadow-lg p-6 flex flex-col justify-between fixed">
            {/* Logo Section */}
            <div>
                <div className="flex items-center justify-center mt-[-20px]">
                    <Image src={AGRIMART} alt="Agrimart Logo" className="w-48" />
                </div>
                <h2 className="text-gray-500 uppercase font-poppins-bold text-sm">Menu</h2>

                {/* Menu Items */}
                <nav className="mt-8 space-y-6 font-poppins-regular">
                    <LinkItem href="/" icon={<Home size={20} />} label="Home" />
                    <LinkItem href="/farmerAddProduct" icon={<PlusCircle size={20} />} label="Add Product" />
                    <LinkItem href="/signup-page" icon={<Package2 size={20} />} label="Update Product" />
                    <LinkItem href="/view-order" icon={<Eye size={20} />} label="View Order" />
                    <LinkItem href="/customers" icon={<Users size={20} />} label="Customers" />
                    <LinkItem href="/sales" icon={<LineChart size={20} />} label="Sales" />
                    <LinkItem href="/reports" icon={<FileText size={20} />} label="Reports" />
                </nav>
            </div>

            {/* Bottom Button */}
            <div className="bg-[#88C34E] mt-[20px] font-poppins-regular rounded-full rounded-bl-none  text-white text-center p-3  text-xs font-semibold">
                If you want to buy fresh farming products, <br />
                <Link href="/help" className=" font-coiny mt-[5px] text-[15px]">Click Here</Link>
            </div>
        </aside>
    );
};

type LinkItemProps = {
    href: string;
    icon: React.ReactNode;
    label: string;
};

const LinkItem = ({ href, icon, label }: LinkItemProps) => (
    <Link href={href} className="flex items-center space-x-3 text-gray-700 hover:text-green-500 transition">
        {icon}
        <span className="text-sm font-medium">{label}</span>
    </Link>
);

export default Sidebar;
