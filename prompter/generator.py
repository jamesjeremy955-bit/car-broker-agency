from dataclasses import dataclass

@dataclass
class VehicleListing:
    make: str
    model: str
    year: int
    asking_price: int
    seller_name: str
    platform: str

class BrokerPrompter:
    @staticmethod
    def first_outreach(listing: VehicleListing) -> str:
        return (
            f"Hi {listing.seller_name}, is the {listing.year} {listing.make} {listing.model} "
            f"still available? What is your lowest cash price for an inspection-ready deal this week?"
        )

    @staticmethod
    def stale_followup(listing: VehicleListing) -> str:
        return (
            f"Hey {listing.seller_name}, following up on the {listing.model}. "
            f"Still looking to sell, or has it moved?"
        )

if __name__ == "__main__":
    test_lead = VehicleListing("Porsche", "911 Carrera", 1989, 65000, "Alex", "Craigslist")
    print("Prompter Test Output:")
    print(BrokerPrompter.first_outreach(test_lead))
