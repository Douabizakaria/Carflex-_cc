import PackCard from '../PackCard';
import budgetCarImg from '@assets/generated_images/Budget_pack_car_81b93d9f.png';

export default function PackCardExample() {
  return (
    <div className="max-w-sm">
      <PackCard
        name="Budget"
        subtitle="Economy & Compact"
        image={budgetCarImg}
        priceMonthly={299}
        priceYearly={2990}
        features={[
          "Economy and compact vehicles",
          "Unlimited mileage",
          "Basic insurance included",
          "24/7 roadside assistance",
          "Free vehicle swaps (once/month)",
        ]}
        billingPeriod="monthly"
        onSelect={() => console.log('Budget pack selected')}
      />
    </div>
  );
}
