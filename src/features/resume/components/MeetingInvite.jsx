// MeetingInvite.jsx
const start = "20251015T210000Z"; // 2:00 PM Seattle (PDT, UTC-7) → 21:00 UTC
const end = "20251015T213000Z"; // 2:30 PM Seattle → 21:30 UTC

const title = "1:1 with Omer Zahid";
const details =
    "In this meeting Omer Zahid will introduce himself and talk about project and future road map and how can we help grow your business with simple and free solution that generates money rather than just paying subscription and bills.";
const location = "Online";

// Add guests (comma-separated)
const guests = "omer.zahid@mnsu.edu,omer.zahid@hotmail.com";

// Build Google Calendar template URL safely
const gcalParams = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    details,
    location,
    dates: `${start}/${end}`,
    add: guests,
});
const gcalUrl = `https://calendar.google.com/calendar/render?${gcalParams.toString()}`;

export default function MeetingInvite() {
    return (
        <a
            href={gcalUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
                background:
                    "#4285f4 radial-gradient(circle at 50% 50%, #00bfff, #0077ff 70%)",
                fontWeight: 700,
                color: "#fff",
                padding: "10px 16px",
                borderRadius: "10px",
                boxShadow: "0 0 10px #00bfff88, 0 0 30px #0077ff44",
                transition: "all 0.3s ease",
                cursor: "pointer",
                textDecoration: "none",
                display: "inline-block",
            }}
            onMouseEnter={(e) =>
            (e.currentTarget.style.boxShadow =
                "0 0 20px #00bfffcc, 0 0 40px #0077ffaa")
            }
            onMouseLeave={(e) =>
            (e.currentTarget.style.boxShadow =
                "0 0 10px #00bfff88, 0 0 30px #0077ff44")
            }
        >
            📅 Meet with Omer Zahid
        </a>
    );
}
