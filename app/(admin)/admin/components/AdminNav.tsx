const navItems = [
  {
    title: "Overview",
    href: "/admin",
  },
  {
    title: "Products",
    href: "/admin/products",
  },
  {
    title: "Orders",
    href: "/admin/orders",
  },
  {
    title: "Promotions",
    href: "/admin/promotions",
    subItems: [
      {
        title: "All Promotions",
        href: "/admin/promotions",
      },
      {
        title: "Coupons",
        href: "/admin/promotions/coupons",
      },
      {
        title: "Discounts",
        href: "/admin/promotions/discounts",
      },
    ],
  },
  {
    title: "Reviews",
    href: "/admin/reviews",
    subItems: [
      {
        title: "All Reviews",
        href: "/admin/reviews",
      },
      {
        title: "Pending Reviews",
        href: "/admin/reviews/pending",
      },
      {
        title: "Approved Reviews",
        href: "/admin/reviews/approved",
      },
      {
        title: "Rejected Reviews",
        href: "/admin/reviews/rejected",
      },
    ],
  },
  {
    title: "Customers",
    href: "/admin/customers",
  },
  {
    title: "Settings",
    href: "/admin/settings",
  },
];
