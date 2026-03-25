--// CONFIG
local LOGO_ID = "rbxassetid://119785180991880"

--// SERVICES
local player = game.Players.LocalPlayer
local UIS = game:GetService("UserInputService")
local RunService = game:GetService("RunService")

--// GUI
local gui = Instance.new("ScreenGui", player.PlayerGui)
gui.Name = "LocShadowHub"

-- Logo
local logo = Instance.new("ImageButton", gui)
logo.Size = UDim2.new(0,60,0,60)
logo.Position = UDim2.new(0,20,0,200)
logo.Image = LOGO_ID
logo.BackgroundTransparency = 1

-- Frame
local frame = Instance.new("Frame", gui)
frame.Size = UDim2.new(0,300,0,260)
frame.Position = UDim2.new(0.5,-150,0.5,-130)
frame.Visible = false
frame.BackgroundColor3 = Color3.fromRGB(20,20,20)

-- Toggle GUI
logo.MouseButton1Click:Connect(function()
    frame.Visible = not frame.Visible
end)

-- Drag
local dragging, startPos, startInput
frame.InputBegan:Connect(function(input)
    if input.UserInputType == Enum.UserInputType.MouseButton1 then
        dragging = true
        startInput = input.Position
        startPos = frame.Position
    end
end)

frame.InputEnded:Connect(function(input)
    if input.UserInputType == Enum.UserInputType.MouseButton1 then
        dragging = false
    end
end)

UIS.InputChanged:Connect(function(input)
    if dragging and input.UserInputType == Enum.UserInputType.MouseMovement then
        local delta = input.Position - startInput
        frame.Position = UDim2.new(
            startPos.X.Scale,
            startPos.X.Offset + delta.X,
            startPos.Y.Scale,
            startPos.Y.Offset + delta.Y
        )
    end
end)

--// TITLE
local title = Instance.new("TextLabel", frame)
title.Size = UDim2.new(1,0,0,40)
title.Text = "LOC SHADOW HUB"
title.TextScaled = true
title.BackgroundTransparency = 1
title.TextColor3 = Color3.new(1,1,1)

--// BUTTON CREATOR
local function createBtn(text, y)
    local btn = Instance.new("TextButton", frame)
    btn.Size = UDim2.new(0.9,0,0,30)
    btn.Position = UDim2.new(0.05,0,0,y)
    btn.Text = text
    btn.BackgroundColor3 = Color3.fromRGB(40,40,40)
    btn.TextColor3 = Color3.new(1,1,1)
    return btn
end

-- Buttons
local invisBtn = createBtn("MAP INVISIBLE", 50)
local whiteBtn = createBtn("WHITE SCREEN", 90)
local blackBtn = createBtn("BLACK SCREEN", 130)

-- FPS dropdown
local fpsBtn = createBtn("SELECT FPS ▼", 170)
local applyFps = createBtn("✔ APPLY FPS", 210)

-- Dropdown list
local fpsList = Instance.new("Frame", frame)
fpsList.Size = UDim2.new(0.9,0,0,90)
fpsList.Position = UDim2.new(0.05,0,0,200)
fpsList.Visible = false
fpsList.BackgroundColor3 = Color3.fromRGB(30,30,30)

local fpsOptions = {30,60,90,120,144}
local selectedFPS = 60

for i,v in pairs(fpsOptions) do
    local b = Instance.new("TextButton", fpsList)
    b.Size = UDim2.new(1,0,0,18)
    b.Position = UDim2.new(0,0,0,(i-1)*18)
    b.Text = tostring(v)
    b.BackgroundColor3 = Color3.fromRGB(50,50,50)

    b.MouseButton1Click:Connect(function()
        selectedFPS = v
        fpsBtn.Text = "FPS: "..v
    end)
end

fpsBtn.MouseButton1Click:Connect(function()
    fpsList.Visible = not fpsList.Visible
end)

--// FUNCTIONS

-- Map invisible (vẫn đứng được)
local mapEnabled = false
invisBtn.MouseButton1Click:Connect(function()
    mapEnabled = not mapEnabled

    for _,v in pairs(workspace:GetDescendants()) do
        if v:IsA("BasePart") then
            v.Transparency = mapEnabled and 1 or 0
            v.CastShadow = not mapEnabled
        elseif v:IsA("Decal") or v:IsA("Texture") then
            if mapEnabled then v.Transparency = 1 else v.Transparency = 0 end
        end
    end
end)

-- White / Black screen
local screen = Instance.new("Frame", gui)
screen.Size = UDim2.new(1,0,1,0)
screen.Visible = false
screen.ZIndex = 999

whiteBtn.MouseButton1Click:Connect(function()
    screen.Visible = true
    screen.BackgroundColor3 = Color3.new(1,1,1)
end)

blackBtn.MouseButton1Click:Connect(function()
    screen.Visible = true
    screen.BackgroundColor3 = Color3.new(0,0,0)
end)

screen.InputBegan:Connect(function()
    screen.Visible = false
end)

-- FPS LOCK
applyFps.MouseButton1Click:Connect(function()
    if setfpscap then
        setfpscap(selectedFPS)
    end
end)
