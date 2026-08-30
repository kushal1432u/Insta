import asyncio
import os
import re
import json
import pandas as pd

from datetime import datetime
from playwright.async_api import async_playwright


# ============================================================
# SETTINGS
# ============================================================

PROFILE_URL = (
    "https://www.instagram.com/puridistrictadmin/reels/"
)

# EXACT NUMBER OF REELS REQUIRED
MAX_REEL_URLS = 228

# HIGH SPEED
CONCURRENT_TABS = 20

# Output Excel
OUTPUT_FILE = "instagram_reels_228.xlsx"

# Chrome profile
CHROME_PROFILE = os.path.abspath(
    "instagram_chrome_profile"
)

# Profile scrolling
MAX_SCROLLS = 300

# Save progress every N records
SAVE_EVERY = 20


# ============================================================
# NUMBER CONVERTER
# ============================================================

def convert_number(value):

    if value is None:
        return None

    value = str(value).strip()

    value = value.replace(",", "")
    value = value.replace(" ", "")

    value = value.upper()

    # Examples:
    # 924
    # 1.2K
    # 3.5M

    match = re.search(
        r"([\d.]+)\s*([KMB]?)",
        value
    )

    if not match:
        return None

    try:

        number = float(
            match.group(1)
        )

    except Exception:

        return None

    suffix = match.group(2)

    if suffix == "K":

        number *= 1000

    elif suffix == "M":

        number *= 1000000

    elif suffix == "B":

        number *= 1000000000

    return int(number)


# ============================================================
# DURATION FORMAT
# ============================================================

def format_duration(seconds):

    if seconds is None:
        return None

    try:

        seconds = float(seconds)

    except Exception:

        return None

    if seconds <= 0:
        return None

    seconds = int(round(seconds))

    minutes = seconds // 60

    remaining = seconds % 60

    return f"{minutes:02d}:{remaining:02d}"


# ============================================================
# RESOURCE BLOCKING
# ============================================================

async def block_heavy_resources(route):

    request = route.request

    resource_type = request.resource_type

    url = request.url.lower()

    # Do NOT load images/fonts/stylesheets.
    #
    # We also avoid media because we don't want
    # to download the actual Reel video.

    if resource_type in {
        "image",
        "font",
        "stylesheet",
        "media"
    }:

        await route.abort()

        return

    # Tracking / analytics
    blocked = [

        "doubleclick",

        "googlesyndication",

        "google-analytics",

        "analytics.google",

        "connect.facebook.net",

        "facebook.com/tr",

        "pixel"
    ]

    for item in blocked:

        if item in url:

            await route.abort()

            return

    await route.continue_()


# ============================================================
# CLOSE INSTAGRAM POPUPS
# ============================================================

async def close_popups(page):

    selectors = [

        'button[aria-label="Close"]',

        '[role="button"][aria-label="Close"]',

        'svg[aria-label="Close"]',

        '[aria-label="Close"]',

        'button:has-text("Not Now")',

        'button:has-text("Not now")',

    ]

    for selector in selectors:

        try:

            elements = page.locator(
                selector
            )

            count = await elements.count()

            for i in range(count):

                try:

                    element = elements.nth(i)

                    if await element.is_visible():

                        await element.click(
                            timeout=500
                        )

                        await asyncio.sleep(
                            0.1
                        )

                except Exception:

                    pass

        except Exception:

            pass


# ============================================================
# EXTRACT JSON-LD
# ============================================================

async def extract_jsonld(page):

    result = {}

    try:

        scripts = page.locator(
            'script[type="application/ld+json"]'
        )

        count = await scripts.count()

        for i in range(count):

            try:

                text = await scripts.nth(
                    i
                ).text_content()

                if not text:
                    continue

                data = json.loads(text)

                if isinstance(data, list):

                    items = data

                else:

                    items = [data]

                for item in items:

                    if not isinstance(
                        item,
                        dict
                    ):

                        continue

                    # Caption
                    if item.get(
                        "caption"
                    ):

                        result["caption"] = (
                            item["caption"]
                        )

                    # Description
                    if item.get(
                        "description"
                    ):

                        result["description"] = (
                            item["description"]
                        )

                    # Published date
                    if item.get(
                        "uploadDate"
                    ):

                        result["date"] = (
                            item["uploadDate"]
                        )

                    if item.get(
                        "datePublished"
                    ):

                        result["date"] = (
                            item["datePublished"]
                        )

                    # Duration
                    if item.get(
                        "duration"
                    ):

                        result["duration"] = (
                            item["duration"]
                        )

                    # Interaction statistics
                    statistics = item.get(
                        "interactionStatistic"
                    )

                    if isinstance(
                        statistics,
                        list
                    ):

                        for stat in statistics:

                            if not isinstance(
                                stat,
                                dict
                            ):

                                continue

                            interaction = str(
                                stat.get(
                                    "interactionType",
                                    ""
                                )
                            ).lower()

                            count_value = (
                                stat.get(
                                    "userInteractionCount"
                                )
                            )

                            if count_value is None:
                                continue

                            if "like" in interaction:

                                result["likes"] = (
                                    count_value
                                )

                            elif (
                                "comment"
                                in interaction
                            ):

                                result["comments"] = (
                                    count_value
                                )

                            elif (
                                "view"
                                in interaction
                            ):

                                result["views"] = (
                                    count_value
                                )

            except Exception:

                pass

    except Exception:

        pass

    return result


# ============================================================
# META DESCRIPTION
# ============================================================

async def get_og_description(page):

    try:

        element = page.locator(
            'meta[property="og:description"]'
        )

        if await element.count():

            return await element.first.get_attribute(
                "content"
            )

    except Exception:

        pass

    return None


# ============================================================
# META TITLE
# ============================================================

async def get_page_title(page):

    try:

        title = await page.title()

        if title:

            return title.strip()

    except Exception:

        pass

    return None


# ============================================================
# PARSE INSTAGRAM TEXT
# ============================================================

def parse_instagram_text(text):

    result = {

        "username": None,

        "likes": None,

        "comments": None,

        "date": None,

        "caption": None,

        "title": None,

        "description": None,

        "hashtags": None

    }

    if not text:

        return result

    text = text.strip()

    # ========================================================
    # LIKES
    # ========================================================

    match = re.search(

        r"([\d,.]+(?:[KMB])?)\s+likes?",

        text,

        re.IGNORECASE

    )

    if match:

        result["likes"] = convert_number(
            match.group(1)
        )

    # ========================================================
    # COMMENTS
    # ========================================================

    match = re.search(

        r"([\d,.]+(?:[KMB])?)\s+comments?",

        text,

        re.IGNORECASE

    )

    if match:

        result["comments"] = convert_number(
            match.group(1)
        )

    # ========================================================
    # USERNAME
    # ========================================================

    match = re.search(

        r"-\s*([A-Za-z0-9_.]+)\s+on\s+",

        text,

        re.IGNORECASE

    )

    if match:

        result["username"] = (
            match.group(1)
        )

    # ========================================================
    # DATE
    # ========================================================

    match = re.search(

        r"\bon\s+"
        r"([A-Za-z]+\s+\d{1,2},\s+\d{4})",

        text,

        re.IGNORECASE

    )

    if match:

        result["date"] = (
            match.group(1)
        )

    # ========================================================
    # CAPTION
    # ========================================================

    caption = None

    # Caption surrounded by quotes
    match = re.search(

        r':\s*"([\s\S]*)"\s*$',

        text

    )

    if match:

        caption = (
            match.group(1)
            .strip()
        )

    else:

        # Anything after :
        match = re.search(

            r":\s*(.*)$",

            text,

            re.DOTALL

        )

        if match:

            caption = (
                match.group(1)
                .strip()
                .strip('"')
                .strip()
            )

    if not caption:

        return result

    result["caption"] = caption

    # ========================================================
    # HASHTAGS
    # ========================================================

    hashtags = re.findall(

        r"#[^\s#]+",

        caption

    )

    if hashtags:

        result["hashtags"] = (
            " ".join(hashtags)
        )

    # ========================================================
    # REMOVE HASHTAGS
    # ========================================================

    clean_caption = re.sub(

        r"#[^\s#]+",

        "",

        caption

    ).strip()

    # ========================================================
    # SPLIT LINES
    # ========================================================

    lines = [

        line.strip()

        for line
        in clean_caption.splitlines()

        if line.strip()

    ]

    # ========================================================
    # TITLE / DESCRIPTION
    # ========================================================

    if len(lines) >= 2:

        result["title"] = lines[0]

        result["description"] = (
            " ".join(lines[1:])
        )

    else:

        separators = [

            "—",

            "–",

            " - ",

            ":"

        ]

        found = False

        for separator in separators:

            if separator in clean_caption:

                parts = clean_caption.split(

                    separator,

                    1

                )

                left = parts[0].strip()

                right = parts[1].strip()

                if left and right:

                    result["title"] = left

                    result["description"] = right

                    found = True

                    break

        if not found:

            sentence = re.match(

                r"(.+?[.!?])\s+(.+)$",

                clean_caption,

                re.DOTALL

            )

            if sentence:

                result["title"] = (
                    sentence.group(1).strip()
                )

                result["description"] = (
                    sentence.group(2).strip()
                )

            else:

                result["title"] = (
                    clean_caption
                )

                result["description"] = ""

    return result


# ============================================================
# EXTRACT DURATION
# ============================================================

async def extract_duration(page):

    # First look for video element
    try:

        videos = page.locator(
            "video"
        )

        count = await videos.count()

        for i in range(count):

            try:

                duration = await videos.nth(
                    i
                ).evaluate(

                    """
                    video => video.duration
                    """

                )

                formatted = format_duration(
                    duration
                )

                if formatted:

                    return formatted

            except Exception:

                pass

    except Exception:

        pass

    # Try metadata / text
    try:

        content = await page.locator(
            "body"
        ).inner_text(
            timeout=3000
        )

        # mm:ss
        matches = re.findall(

            r"\b(\d{1,2}):([0-5]\d)\b",

            content

        )

        for minutes, seconds in matches:

            total = (
                int(minutes) * 60
                + int(seconds)
            )

            if total > 0:

                return format_duration(
                    total
                )

    except Exception:

        pass

    return None


# ============================================================
# EXTRACT REEL
# ============================================================

async def process_reel(

    context,

    url,

    index,

    total

):

    result = {

        "Reel No": index,

        "Reel URL": url,

        "Username": None,

        "Likes": None,

        "Comments": None,

        "Published Date": None,

        "Title": None,

        "Description": None,

        "Hashtags": None,

        "Full Caption": None,

        "Views / Plays": None,

        "Duration": None,

        "Status": "Failed",

        "Error": None,

        "Scraped At":
            datetime.now().strftime(
                "%Y-%m-%d %H:%M:%S"
            )

    }

    page = None

    try:

        # ====================================================
        # CREATE PAGE
        # ====================================================

        page = await context.new_page()

        # ====================================================
        # OPEN REEL
        # ====================================================

        await page.goto(

            url,

            wait_until="domcontentloaded",

            timeout=30000

        )

        # Very short wait
        await page.wait_for_timeout(
            800
        )

        # ====================================================
        # POPUPS
        # ====================================================

        await close_popups(
            page
        )

        # ====================================================
        # META
        # ====================================================

        meta_description = (
            await get_og_description(
                page
            )
        )

        page_title = (
            await get_page_title(
                page
            )
        )

        # ====================================================
        # JSON-LD
        # ====================================================

        jsonld = (
            await extract_jsonld(
                page
            )
        )

        # ====================================================
        # PARSE META
        # ====================================================

        parsed = parse_instagram_text(
            meta_description
        )

        # ====================================================
        # CAPTION FALLBACK
        # ====================================================

        caption = (
            parsed.get("caption")
            or
            jsonld.get("caption")
            or
            jsonld.get("description")
        )

        if caption:

            parsed["caption"] = caption

            # Hashtags
            hashtags = re.findall(

                r"#[^\s#]+",

                caption

            )

            if hashtags:

                parsed["hashtags"] = (
                    " ".join(hashtags)
                )

            # Clean caption
            clean = re.sub(

                r"#[^\s#]+",

                "",

                caption

            ).strip()

            # If title wasn't detected
            if not parsed.get("title"):

                lines = [

                    x.strip()

                    for x
                    in clean.splitlines()

                    if x.strip()

                ]

                if len(lines) >= 2:

                    parsed["title"] = (
                        lines[0]
                    )

                    parsed["description"] = (
                        " ".join(lines[1:])
                    )

                else:

                    parsed["title"] = clean

                    parsed["description"] = ""

        # ====================================================
        # TITLE FALLBACK
        # ====================================================

        if not parsed.get("title"):

            if page_title:

                cleaned_title = (
                    page_title
                    .replace(
                        " • Instagram",
                        ""
                    )
                    .strip()
                )

                parsed["title"] = (
                    cleaned_title
                )

        # ====================================================
        # LIKES
        # ====================================================

        result["Likes"] = (

            parsed.get("likes")

            or

            jsonld.get("likes")

        )

        # ====================================================
        # COMMENTS
        # ====================================================

        result["Comments"] = (

            parsed.get("comments")

            or

            jsonld.get("comments")

        )

        # ====================================================
        # USERNAME
        # ====================================================

        result["Username"] = (
            parsed.get("username")
        )

        # ====================================================
        # DATE
        # ====================================================

        result["Published Date"] = (
            parsed.get("date")
            or
            jsonld.get("date")
        )

        # ====================================================
        # TITLE
        # ====================================================

        result["Title"] = (
            parsed.get("title")
        )

        # ====================================================
        # DESCRIPTION
        # ====================================================

        result["Description"] = (
            parsed.get("description")
        )

        # ====================================================
        # HASHTAGS
        # ====================================================

        result["Hashtags"] = (
            parsed.get("hashtags")
        )

        # ====================================================
        # FULL CAPTION
        # ====================================================

        result["Full Caption"] = (
            parsed.get("caption")
        )

        # ====================================================
        # VIEWS
        # ====================================================

        result["Views / Plays"] = (
            jsonld.get("views")
        )

        # ====================================================
        # DURATION
        # ====================================================

        duration = (
            jsonld.get("duration")
        )

        if duration:

            result["Duration"] = duration

        else:

            result["Duration"] = (
                await extract_duration(
                    page
                )
            )

        # ====================================================
        # SUCCESS
        # ====================================================

        result["Status"] = "Success"

        likes = result["Likes"]
        comments = result["Comments"]

        print(

            f"\n✓ [{index}/{total}] "
            f"{likes} likes | "
            f"{comments} comments"

        )

    except Exception as error:

        result["Error"] = (
            str(error)[:500]
        )

        print(

            f"\n✗ [{index}/{total}] "
            f"FAILED"

        )

    finally:

        if page:

            try:

                await page.close()

            except Exception:

                pass

    return result


# ============================================================
# COLLECT REEL URLS
# ============================================================

async def collect_reel_urls(page):

    print()
    print("=" * 75)
    print("COLLECTING REEL URLS")
    print("=" * 75)

    urls = []

    seen = set()

    last_height = 0

    unchanged = 0

    for scroll_number in range(
        1,
        MAX_SCROLLS + 1
    ):

        # ====================================================
        # CLOSE POPUPS
        # ====================================================

        await close_popups(
            page
        )

        # ====================================================
        # FIND REEL LINKS
        # ====================================================

        links = await page.locator(
            'a[href*="/reel/"]'
        ).all()

        for link in links:

            try:

                href = await link.get_attribute(
                    "href"
                )

                if not href:

                    continue

                if "/reel/" not in href:

                    continue

                if href.startswith("/"):

                    href = (
                        "https://www.instagram.com"
                        + href
                    )

                href = href.split(
                    "?",
                    1
                )[0]

                href = href.rstrip("/")

                if href in seen:

                    continue

                seen.add(href)

                urls.append(href)

                print(

                    f"\rCollected "
                    f"{len(urls)}/"
                    f"{MAX_REEL_URLS}",

                    end="",

                    flush=True

                )

                # =================================================
                # EXACTLY 228
                # =================================================

                if len(urls) >= MAX_REEL_URLS:

                    print()

                    print()

                    print(
                        f"✓ Collected "
                        f"{MAX_REEL_URLS} "
                        f"Reel URLs."
                    )

                    return urls[
                        :MAX_REEL_URLS
                    ]

            except Exception:

                pass

        # ====================================================
        # CURRENT PAGE HEIGHT
        # ====================================================

        try:

            current_height = (
                await page.evaluate(
                    """
                    document.documentElement
                        .scrollHeight
                    """
                )
            )

        except Exception:

            current_height = 0

        # ====================================================
        # CHECK IF PAGE GROWS
        # ====================================================

        if current_height == last_height:

            unchanged += 1

        else:

            unchanged = 0

        last_height = current_height

        # ====================================================
        # FAST SCROLL
        # ====================================================

        try:

            await page.evaluate(
                """
                window.scrollBy(
                    0,
                    Math.max(
                        window.innerHeight * 2.5,
                        2500
                    )
                );
                """
            )

        except Exception:

            pass

        # ====================================================
        # WAIT FOR INSTAGRAM TO LOAD
        # ====================================================

        await page.wait_for_timeout(
            600
        )

        # ====================================================
        # EVERY 5 SCROLLS GO TO BOTTOM
        # ====================================================

        if scroll_number % 5 == 0:

            try:

                await page.evaluate(
                    """
                    window.scrollTo(
                        0,
                        document.body.scrollHeight
                    );
                    """
                )

            except Exception:

                pass

            await page.wait_for_timeout(
                1000
            )

        # ====================================================
        # STATUS
        # ====================================================

        print(

            f"\rCollected "
            f"{len(urls)}/"
            f"{MAX_REEL_URLS}"
            f" | Scroll {scroll_number}",

            end="",

            flush=True

        )

        # ====================================================
        # DO NOT STOP TOO EARLY
        # ====================================================

        if unchanged >= 15:

            print()

            print(
                "\nInstagram did not load "
                "new content for a while."
            )

            print(
                "Trying additional scroll..."
            )

            unchanged = 0

            try:

                await page.evaluate(
                    """
                    window.scrollTo(
                        0,
                        document.body.scrollHeight
                    );
                    """
                )

                await page.wait_for_timeout(
                    2000
                )

            except Exception:

                pass

    print()

    print(
        f"\nFinished collecting."
    )

    print(
        f"Total Reel URLs found: "
        f"{len(urls)}"
    )

    return urls[
        :MAX_REEL_URLS
    ]


# ============================================================
# SAVE EXCEL
# ============================================================

def save_excel(results):

    if not results:

        return

    columns = [

        "Reel No",

        "Reel URL",

        "Username",

        "Likes",

        "Comments",

        "Published Date",

        "Title",

        "Description",

        "Hashtags",

        "Full Caption",

        "Views / Plays",

        "Duration",

        "Status",

        "Error",

        "Scraped At"

    ]

    df = pd.DataFrame(
        results
    )

    # Ensure all columns exist
    for column in columns:

        if column not in df.columns:

            df[column] = None

    df = df[
        columns
    ]

    # ========================================================
    # EXCEL SAVE
    # ========================================================

    df.to_excel(

        OUTPUT_FILE,

        index=False

    )


# ============================================================
# PARALLEL PROCESSING
# ============================================================

async def process_all_reels(

    context,

    reel_urls

):

    total = len(
        reel_urls
    )

    results = []

    semaphore = asyncio.Semaphore(
        CONCURRENT_TABS
    )

    async def worker(

        url,

        index

    ):

        async with semaphore:

            return await process_reel(

                context,

                url,

                index,

                total

            )

    # ========================================================
    # CREATE TASKS
    # ========================================================

    tasks = [

        asyncio.create_task(

            worker(

                url,

                index

            )

        )

        for index, url

        in enumerate(

            reel_urls,

            start=1

        )

    ]

    completed = 0

    # ========================================================
    # PROCESS AS THEY FINISH
    # ========================================================

    for future in asyncio.as_completed(
        tasks
    ):

        try:

            result = await future

            results.append(
                result
            )

        except Exception as error:

            print(
                "\nWorker error:",
                error
            )

            continue

        completed += 1

        # ====================================================
        # PERIODIC SAVE
        # ====================================================

        successful = [

            x

            for x in results

            if x["Status"] == "Success"

        ]

        if (

            len(successful) > 0

            and

            len(successful)
            % SAVE_EVERY == 0

        ):

            save_excel(
                successful
            )

            print(

                f"\n💾 Progress saved: "
                f"{len(successful)} records"

            )

        print(

            f"\nProgress: "
            f"{completed}/{total}",

            end="",

            flush=True

        )

    return results


# ============================================================
# MAIN
# ============================================================

async def main():

    print()
    print("=" * 75)
    print("       HIGH-SPEED INSTAGRAM REEL SCRAPER")
    print("=" * 75)

    print()
    print("Profile:")
    print(PROFILE_URL)

    print()
    print(
        f"Target Reels: {MAX_REEL_URLS}"
    )

    print()
    print(
        f"Parallel tabs: {CONCURRENT_TABS}"
    )

    print()
    print(
        "Date filtering: DISABLED"
    )

    print("=" * 75)

    async with async_playwright() as playwright:

        # ====================================================
        # START CHROME
        # ====================================================

        print()
        print(
            "Starting Chrome..."
        )

        context = await playwright.chromium.launch_persistent_context(

            CHROME_PROFILE,

            channel="chrome",

            headless=False,

            viewport={
                "width": 1400,
                "height": 900
            },

            args=[

                "--disable-blink-features="
                "AutomationControlled",

                "--disable-background-networking",

                "--disable-background-timer-throttling",

                "--disable-renderer-backgrounding",

                "--disable-features=TranslateUI",

                "--no-first-run",

                "--no-default-browser-check"

            ]

        )

        # ====================================================
        # BLOCK HEAVY RESOURCES
        # ====================================================

        await context.route(

            "**/*",

            block_heavy_resources

        )

        # ====================================================
        # OPEN PROFILE
        # ====================================================

        profile_page = (
            await context.new_page()
        )

        print()
        print(
            "Opening Instagram..."
        )

        await profile_page.goto(

            PROFILE_URL,

            wait_until="domcontentloaded",

            timeout=60000

        )

        await profile_page.wait_for_timeout(
            3000
        )

        await close_popups(
            profile_page
        )

        print()
        print(
            "Instagram opened."
        )

        print()
        print(
            "If Instagram asks you to log in,"
        )

        print(
            "log in manually in the Chrome window."
        )

        print()
        print(
            "Waiting 8 seconds..."
        )

        await profile_page.wait_for_timeout(
            8000
        )

        # ====================================================
        # COLLECT 228 URLs
        # ====================================================

        reel_urls = await collect_reel_urls(

            profile_page

        )

        await profile_page.close()

        # ====================================================
        # NO URLS
        # ====================================================

        if not reel_urls:

            print()
            print(
                "❌ No Reel URLs found."
            )

            await context.close()

            return

        # ====================================================
        # PROCESS
        # ====================================================

        print()
        print("=" * 75)

        print(
            f"PROCESSING "
            f"{len(reel_urls)} REELS"
        )

        print(
            f"USING "
            f"{CONCURRENT_TABS} PARALLEL TABS"
        )

        print("=" * 75)

        all_results = await process_all_reels(

            context,

            reel_urls

        )

        # ====================================================
        # SUCCESSFUL RESULTS
        # ====================================================

        successful_results = [

            result

            for result in all_results

            if result["Status"] == "Success"

        ]

        # ====================================================
        # SORT BY ORIGINAL REEL ORDER
        # ====================================================

        successful_results.sort(

            key=lambda x:
            x["Reel No"]

        )

        # ====================================================
        # RENUMBER
        # ====================================================

        for index, result in enumerate(

            successful_results,

            start=1

        ):

            result["Reel No"] = index

        # ====================================================
        # FINAL SAVE
        # ====================================================

        save_excel(

            successful_results

        )

        # ====================================================
        # SUMMARY
        # ====================================================

        print()
        print()
        print("=" * 75)
        print("                    COMPLETE")
        print("=" * 75)

        print()

        print(
            f"URLs collected      : "
            f"{len(reel_urls)}"
        )

        print(
            f"Successfully scraped: "
            f"{len(successful_results)}"
        )

        print(
            f"Failed              : "
            f"{len(all_results) - len(successful_results)}"
        )

        print()

        print(
            "Excel file:"
        )

        print(
            os.path.abspath(
                OUTPUT_FILE
            )
        )

        print()

        print("=" * 75)

        await context.close()


# ============================================================
# START PROGRAM
# ============================================================

if __name__ == "__main__":

    try:

        asyncio.run(
            main()
        )

    except KeyboardInterrupt:

        print()
        print(
            "Stopped by user."
        )

    except Exception as error:

        print()
        print(
            "PROGRAM ERROR:"
        )

        print(
            error
        )